import etro from '../../src/index'
import { mockAudioContext, mockCanvas, mockTime } from './mocks/dom'
import { mockBaseEffect } from './mocks/effect'
import { mockBaseLayer } from './mocks/layer'

describe('Unit Tests ->', function () {
  describe('Movie', function () {
    let movie

    beforeEach(function () {
      movie = new etro.Movie({
        actx: mockAudioContext(),
        canvas: mockCanvas(),
        autoRefresh: false
      })
      movie.addLayer(mockBaseLayer())
    })

    describe('identity ->', function () {
      it("should be of type 'movie'", function () {
        expect(movie.type).toBe('movie')
      })
    })

    describe('layers ->', function () {
      it('should call `tryAttach` when a layer is added', function () {
        const layer = mockBaseLayer()
        // Manually attach layer to movie, because `attach` is stubbed.
        // Otherwise, auto-refresh will cause errors.
        layer._movie = movie

        // Add layer
        movie.layers.push(layer)
        expect(layer.tryAttach).toHaveBeenCalled()
      })

      it('should call `tryDetach` when a layer is removed', function () {
        const layer = movie.layers.shift()
        expect(layer.tryDetach).toHaveBeenCalled()
      })

      it('should call `tryDetach` when a layer is replaced', function () {
        const layer = movie.layers[0]
        movie.layers[0] = mockBaseLayer()
        expect(layer.tryDetach).toHaveBeenCalled()
      })

      it('should implement common array methods', function () {
        const calls = {
          concat: [[mockBaseLayer()]],
          every: [layer => true],
          includes: [mockBaseLayer()],
          pop: [],
          push: [mockBaseLayer()],
          unshift: [mockBaseLayer()]
        }
        for (const method in calls) {
          const args = calls[method]
          const copy = [...movie.layers]
          const expectedResult = Array.prototype[method].apply(copy, args)
          const actualResult = movie.layers[method](...args)
          expect(actualResult).toEqual(expectedResult)
          expect(movie.layers).toEqual(copy)
        }
      })

      it('should not double-attach when `unshift` is called on empty array', function () {
        const layer = mockBaseLayer()
        movie.layers.unshift(layer)
        expect(layer.tryAttach.calls.count()).toBe(1)
      })

      it('should not double-attach new layer when `unshift` is called with an existing item', function () {
        // Start with one layer
        movie.addLayer(mockBaseLayer())

        // Add a layer using `unshift`
        const added = mockBaseLayer()
        movie.layers.unshift(added)

        // Expect both layers to only have been `attach`ed once
        expect(added.tryAttach.calls.count()).toBe(1)
      })

      it('should be able to operate after a layer has been deleted', function (done) {
        mockTime()

        // Start with three layers
        for (let i = 0; i < 3; i++)
          movie.addLayer(mockBaseLayer())

        // Delete the middle layer
        delete movie.layers[1]

        // Let the movie play and pause it again
        movie.play().then(() => {
          done()
        })
        expect(movie.paused).toBe(false)
        movie.pause()
        expect(movie.paused).toBe(true)
      })

      it('should call start when playing', async function () {
        // 1a. Force currentTime to 0
        mockTime(0)

        // 1b. Layer must be inactive to start
        const layer = movie.layers[0]
        layer.active = false

        // 2. Play one frame at the beginning of the movie
        await movie.play()

        // 3. Make sure start was called
        expect(layer.start).toHaveBeenCalledTimes(1)
      })

      it('should not call start when refreshing', async function () {
        // 1a. Force currentTime to 0
        mockTime(0)

        // 1b. Layer must be inactive to start
        const layer = movie.layers[0]
        layer.active = false

        // 2. Play one frame at the beginning of the movie
        await movie.refresh()

        // 3. Make sure start was called
        expect(layer.start).toHaveBeenCalledTimes(0)
      })

      it('should call stop when done playing', async function () {
        // 1a. Force currentTime to be at the end of the movie (currentTime >
        // duration)
        mockTime(2000)

        // 1b. Layer must be active to stop
        const layer = movie.layers[0]
        layer.active = true

        // 2. Play one frame at the end of the movie
        await movie.play()

        // 3. Make sure stop was called
        expect(layer.stop).toHaveBeenCalledTimes(1)
      })

      it('should not call stop when refreshing at end of movie', async function () {
        // 1a. Force currentTime to be at the end of the movie (currentTime >
        // duration)
        mockTime(2000)

        // 1b. Layer must be active to stop
        const layer = movie.layers[0]
        layer.active = true

        // 2. Play one frame at the end of the movie
        await movie.refresh()

        // 3. Make sure stop was called
        expect(layer.stop).toHaveBeenCalledTimes(0)
      })

      it('should call start then stop when recording through', async function () {
        // 1. Record the first 0.1 seconds of the movie
        await movie.record({ frameRate: 10, duration: 0.1 })

        // 2. Make sure neither start or stop were called
        const layer = movie.layers[0]
        expect(layer.start).toHaveBeenCalledTimes(1)
        expect(layer.stop).toHaveBeenCalledTimes(1)
      })

      it('should not start or stop layers when refreshing', async function () {
        // 1. Call refresh on movie
        await movie.refresh()

        // 2. Make sure neither start or stop were called
        const layer = movie.layers[0]
        expect(layer.start).toHaveBeenCalledTimes(0)
        expect(layer.stop).toHaveBeenCalledTimes(0)
      })
    })

    describe('effects ->', function () {
      it('should call `tryAttach` when an effect is added', function () {
        const effect = mockBaseEffect()
        movie.effects.push(effect)
        expect(effect.tryAttach).toHaveBeenCalled()
      })

      it('should call `tryDetach` when an effect is removed', function () {
        const effect = mockBaseEffect()
        movie.effects.push(effect)
        movie.effects.pop()
        expect(effect.tryDetach).toHaveBeenCalled()
      })

      it('should call `tryDetach` when an effect is replaced', function () {
        const effect = mockBaseEffect()
        movie.effects.push(effect)
        movie.effects[0] = mockBaseEffect()
        expect(effect.tryDetach).toHaveBeenCalled()
      })

      it('should implement common array methods', function () {
        const calls = {
          concat: [[mockBaseEffect()]],
          every: [layer => true],
          includes: [mockBaseEffect()],
          pop: [],
          push: [mockBaseEffect()],
          unshift: [mockBaseEffect()]
        }

        for (const method in calls) {
          const args = calls[method]
          const copy = [...movie.effects]
          const expectedResult = Array.prototype[method].apply(copy, args)
          const actualResult = movie.effects[method](...args)
          expect(actualResult).toEqual(expectedResult)
          expect(movie.effects).toEqual(copy)
        }
      })

      it('should be able to play and pause after an effect has been directly deleted', function (done) {
        mockTime()

        // Start with one effect
        movie.addEffect(mockBaseEffect())

        // Delete the effect
        delete movie.effects[0]

        // Let the movie play and pause it again
        movie.play().then(() => {
          done()
        })
        expect(movie.paused).toBe(false)
        movie.pause()
        expect(movie.paused).toBe(true)
      })
    })

    describe('playback ->', function () {
      it('should be ready when all its children are', function () {
        // Remove all layers and effects
        movie.layers.length = 0
        movie.effects.length = 0

        // Add a layer that is ready
        const layer = mockBaseLayer()
        layer.ready = true
        movie.layers.push(layer)

        // Add an effect that is ready
        const effect = mockBaseEffect()
        effect.ready = true
        movie.effects.push(effect)

        // Make sure the movie is ready
        expect(movie.ready).toBe(true)
      })

      it('should not be ready when one of its layers is not', function () {
        // Remove all layers and effects
        movie.layers.length = 0
        movie.effects.length = 0

        // Add a layer that is not ready
        const layer = mockBaseLayer()
        layer.ready = false
        movie.layers.push(layer)

        // Add an effect that is ready
        const effect = mockBaseEffect()
        effect.ready = true
        movie.effects.push(effect)

        // Make sure the movie is not ready
        expect(movie.ready).toBe(false)
      })

      it('should not be ready when one of its effects is not', function () {
        // Remove all layers and effects
        movie.layers.length = 0
        movie.effects.length = 0

        // Add a layer that is ready
        const layer = mockBaseLayer()
        layer.ready = true
        movie.layers.push(layer)

        // Add an effect that is not ready
        const effect = mockBaseEffect()
        effect.ready = false
        movie.effects.push(effect)

        // Make sure the movie is not ready
        expect(movie.ready).toBe(false)
      })

      it('should not be paused while playing', function (done) {
        mockTime()
        movie.play().then(() => {
          done()
        })
        expect(movie.paused).toBe(false)
      })

      it('should be paused after pausing', function (done) {
        mockTime()
        movie.play().then(() => {
          done()
        })
        movie.pause()
        // No promise returned by `pause`, because code is async in implementation.
        expect(movie.paused).toBe(true)
      })

      it('should be paused after stopping', function (done) {
        mockTime()
        movie.play().then(() => {
          done()
        })
        movie.stop()
        expect(movie.paused).toBe(true)
      })

      it('should be paused after playing to the end', async function () {
        mockTime()
        await movie.play()
        expect(movie.paused).toBe(true)
      })

      it('should be reset to beginning after stopping', async function (done) {
        mockTime()
        movie.play().then(() => {
          done()
        })
        movie.stop()
        expect(movie.currentTime).toBe(0)
      })

      it('should be `recording` when recording', function (done) {
        mockTime()
        movie.record({ frameRate: 10 }).then(() => {
          done()
        })

        expect(movie.recording).toBe(true)
      })

      it('should not be paused when recording', function (done) {
        mockTime()
        movie.record({ frameRate: 10 }).then(() => {
          done()
        })

        expect(movie.paused).toBe(false)
      })

      it('should be paused after recording to the end', async function () {
        mockTime()
        await movie.record({ frameRate: 10 })
        expect(movie.paused).toBe(true)
      })

      it('should end recording at the right time when `duration` is supplied', async function () {
        mockTime(0, 300)
        await movie.record({ frameRate: 10, duration: 0.4 })
        // Expect movie.currentTime to be a little larger than 0.4 (the last render might land after 0.4)
        expect(movie.currentTime).toBe(0.4)
      })

      it('should reach the end when recording with no `duration`', async function () {
        await movie.record({ frameRate: 10 })
      })
    })
  })
})
