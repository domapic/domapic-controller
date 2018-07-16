
const test = require('narval')

const mocks = require('../mocks')

const utils = require('../../../lib/utils')

test.describe('utils', () => {
  test.describe('ValidateUniqueModel', () => {
    test.it('should return a function', () => {
      return test.expect(typeof new utils.ValidateUniqueModel()).to.equal('function')
    })

    test.describe('instance', () => {
      const fooField = 'foo'
      const fooErrorMessage = 'foo error message'
      let validator
      let ModelMock

      test.beforeEach(() => {
        ModelMock = new mocks.models.User()
        validator = new utils.ValidateUniqueModel({
          User: ModelMock.stubs.User
        }, 'User', fooField, fooErrorMessage)
      })

      test.afterEach(() => {
        ModelMock.restore()
      })

      test.it('should call to search a document with the same value for the defined field', () => {
        const fooValue = 'foo value'
        return validator(fooValue)
          .then(() => {
            return test.expect(ModelMock.stubs.User.findOne).to.have.been.calledWith({
              foo: fooValue
            })
          })
      })

      test.it('should reject the promise with the defined error message if a document is found', () => {
        ModelMock.stubs.User.findOne.resolves({
        })
        return validator('')
          .then(() => {
            return test.assert.fail()
          }, (error) => {
            return test.expect(error.message).to.equal(fooErrorMessage)
          })
      })

      test.it('should resolve the promise if no document is found', () => {
        return validator('')
          .then(() => {
            return test.expect(true).to.be.true()
          })
      })
    })
  })
})
