
const test = require('narval')

const mocks = require('../mocks')

const utils = require('../../../lib/utils')

test.describe('utils', () => {
  test.describe('ValidateUniqueModel', () => {
    test.it('should return a function', () => {
      return test.expect(typeof utils.ValidateUniqueModel()).to.equal('function')
    })

    test.describe('instance', () => {
      const fooField = 'foo'
      const fooErrorMessage = 'foo error message'
      let validator
      let ModelMock

      test.beforeEach(() => {
        ModelMock = new mocks.models.User()
        validator = utils.ValidateUniqueModel({
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

  test.describe('FieldValidator', () => {
    test.it('should return a function', () => {
      return test.expect(typeof utils.FieldValidator()).to.equal('function')
    })

    test.describe('instance', () => {
      test.it('should call to provided validate function, and resolve if function returns true', () => {
        const fooValidator = test.sinon.stub().returns(true)
        const fieldValidator = utils.FieldValidator(fooValidator)
        const fooValue = 'foo-value'
        return fieldValidator(fooValue)
          .then(() => {
            return test.expect(fooValidator).to.have.been.calledWith(fooValue)
          })
      })

      test.it('should call to template function and return error with message if validator function returns false', () => {
        const fooTemplateMessage = 'foo message'
        const fooValidator = test.sinon.stub().returns(false)
        const fooTemplate = test.sinon.stub().returns(fooTemplateMessage)
        const fieldValidator = utils.FieldValidator(fooValidator, fooTemplate)
        const fooValue = 'foo-value'
        return fieldValidator(fooValue)
          .then(() => {
            return test.assert.fail()
          }, error => {
            return Promise.all([
              test.expect(fooTemplate).to.have.been.calledWith({
                value: fooValue
              }),
              test.expect(error.message).to.deep.equal(fooTemplateMessage)
            ])
          })
      })
    })
  })

  test.describe('transformValidationErrors method', () => {
    test.it('should return the same error if it is not a validation error', () => {
      const error = new Error('foo')
      return utils.transformValidationErrors(error)
        .then(() => {
          return test.assert.fail()
        }, (err) => {
          return test.expect(err).to.equal(error)
        })
    })

    test.it('should return a controlled error with all error details, taking reason.message as message if it exists, or message if it does not', () => {
      const baseMocks = new mocks.Base()
      const error = new Error('foo')
      const fooReturnedError = new Error('foo returned error')
      error.name = 'ValidationError'
      error.errors = {
        'fooError': {
          message: 'foo message'
        },
        'fooError2': {
          reason: {
            message: 'foo message 2'
          }
        }
      }
      baseMocks.stubs.service.errors.BadData.returns(fooReturnedError)

      return utils.transformValidationErrors(error, baseMocks.stubs.service)
        .then(() => {
          return test.assert.fail()
        }, (err) => {
          return Promise.all([
            test.expect(baseMocks.stubs.service.errors.BadData).to.have.been.calledWith('fooError: foo message, fooError2: foo message 2'),
            test.expect(err).to.equal(fooReturnedError)
          ])
        })
    })
  })

  test.describe('isValidName method', () => {
    test.it('should return true if provided name is valid', () => {
      test.expect(utils.isValidName('foo-name.foo_name-122')).to.be.true()
    })

    test.it('should return false if provided name is not valid', () => {
      test.expect(utils.isValidName('Foo#@Name')).to.be.false()
    })

    test.it('should return false if name contains upper letters', () => {
      test.expect(utils.isValidName('Foo')).to.be.false()
    })

    test.it('should return false if name contains other not allowed strange characters', () => {
      test.expect(utils.isValidName('foo^?aad;@')).to.be.false()
    })
  })

  test.describe('isValidAbilityName method', () => {
    test.it('should return true if provided name is valid', () => {
      test.expect(utils.isValidAbilityName('Foo-namefoo_name-122')).to.be.true()
    })

    test.it('should return false if provided name is not valid', () => {
      test.expect(utils.isValidAbilityName('Foo#@Name')).to.be.false()
    })

    test.it('should return false if name contains other not allowed strange characters', () => {
      test.expect(utils.isValidAbilityName('foo^?aad;@')).to.be.false()
    })
  })
})
