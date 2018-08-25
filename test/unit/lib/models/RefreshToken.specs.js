const test = require('narval')

const mocks = require('../../mocks')

const refreshToken = require('../../../../lib/models/refreshToken')

test.describe('refreshToken model', () => {
  test.describe('Model instance', () => {
    let model
    let mongooseMocks
    let utilsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      utilsMocks = new mocks.Utils()
      mongooseMocks = new mocks.Mongoose()
    })

    test.afterEach(() => {
      baseMocks.restore()
      utilsMocks.restore()
      mongooseMocks.restore()
    })

    test.describe('token validation', () => {
      test.it('should call to validate that token is unique', () => {
        model = refreshToken.Model(baseMocks.stubs.service)
        const fooDuplicatedError = new Error('foo duplicated error')
        utilsMocks.stubs.validateUniqueModel.rejects(fooDuplicatedError)
        return model.token.validate.validator('footoken')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooDuplicatedError)
          })
      })
    })
  })
})
