import etro from '../../../src'
import { compareImageData, whenOriginalLoaded } from '../util.spec'

describe('Integration Tests ->', function () {
  describe('Effects ->', function () {
    describe('Contrast ->', function () {
      it('should change the contrast', function () {
        const contrast = new etro.effect.Contrast({
          contrast: 0.5
        })

        return whenOriginalLoaded(original => {
          return compareImageData(original, contrast, 'contrast.png')
        })
      })
    })
  })
})
