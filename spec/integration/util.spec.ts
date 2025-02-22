import etro from '../../src/index'
import resemble from 'resemblejs'

const dummyCanvas = document.createElement('canvas')
dummyCanvas.width = 20
dummyCanvas.height = 20

function getImageData (path, targetCanvas = undefined) {
  return new Promise(resolve => {
    targetCanvas = targetCanvas || document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      targetCanvas.width = img.width
      targetCanvas.height = img.height
      const ctx = targetCanvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.src = 'base/spec/integration/assets/effect/' + path
  })
}

function copyCanvas (source) {
  const dest = document.createElement('canvas')
  dest.width = source.width
  dest.height = source.height
  dest.getContext('2d')
    .drawImage(source, 0, 0)
  return dest
}

export function compareImageData (original, effect, path) {
  return new Promise<void>(resolve => {
    const result = copyCanvas(original)
    const ctx = result.getContext('2d')
    const dummyMovie = new etro.Movie({ canvas: dummyCanvas })
    effect.apply({ canvas: result, cctx: ctx, movie: dummyMovie }) // movie should be unique, to prevent caching!

    resemble(result.toDataURL())
      .compareTo('base/spec/integration/assets/effect/' + path)
      .ignoreAntialiasing()
      .onComplete(data => {
        const misMatch = parseFloat(data.misMatchPercentage)
        expect(misMatch).toBeLessThanOrEqual(1)
        resolve()
      })
  })
}

/*
 * Don't reload the original image for each test, just once;
 * However, Jasmine will exit if we don't start the tests synchronously
 * So, start them, and then wait for the original image to load in the
 * test
 */
export const whenOriginalLoaded = (() => {
  const original = document.createElement('canvas')
  const loadedCallbacks = []
  let loaded = false
  getImageData('original.png', original).then(data => {
    loaded = true
    loadedCallbacks.forEach(callback => callback(original))
  })

  function whenOriginalLoaded (callback) {
    if (!loaded)
      loadedCallbacks.push(callback)
    else
      callback(original)
  }
  return whenOriginalLoaded
})()
