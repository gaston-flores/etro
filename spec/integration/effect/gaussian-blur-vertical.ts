import etro from '../../../src'
import { compareImageData, whenOriginalLoaded } from '../util.spec'

describe('Integration Tests ->', function () {
  describe('Effects ->', function () {
    describe('GaussianBlurVertical ->', function () {
      it('should blur with 5-pixel radius', function () {
        const blur = new etro.effect.GaussianBlurVertical({ radius: 5 })

        return whenOriginalLoaded(original => {
          return compareImageData(original, blur, 'gaussian-blur-vertical.png')
        })
      })
    })
  })
})
