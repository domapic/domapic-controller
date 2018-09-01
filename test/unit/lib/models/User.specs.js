
const md5 = require('md5')
const test = require('narval')

const mocks = require('../../mocks')

const user = require('../../../../lib/models/user')

test.describe('user model', () => {
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

    test.describe('name validation', () => {
      test.it('should use ValidateUniqueModel utility', () => {
        model = user.Model(baseMocks.stubs.service)
        test.expect(model.name.validate.validator).to.equal(utilsMocks.stubs.validateUniqueModel)
      })
    })

    test.describe('email validation', () => {
      test.it('should require email if user has a role different to "service", "plugin", or "service-registerer"', () => {
        model = user.Model(baseMocks.stubs.service)
        test.expect(model.email.required[0].call({
          role: 'admin'
        })).to.be.true()
      })

      test.it('should not require email if user has a role equal to "service", "plugin", or "service-registerer"', () => {
        model = user.Model(baseMocks.stubs.service)
        test.expect(model.email.required[0].call({
          role: 'service'
        })).to.be.false()
      })

      test.it('should throw an error if provided email is not valid', () => {
        model = user.Model(baseMocks.stubs.service)
        return model.email.validate('foo')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err.message).to.contain('is not a valid email')
          })
      })

      test.it('should call to validate that email is unique', () => {
        model = user.Model(baseMocks.stubs.service)
        const fooDuplicatedError = new Error('foo duplicated error')
        utilsMocks.stubs.validateUniqueModel.rejects(fooDuplicatedError)
        return model.email.validate('foo@foo.com')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooDuplicatedError)
          })
      })

      test.it('should resolve the promise if email is valid and unique validation pass', () => {
        model = user.Model(baseMocks.stubs.service)
        return model.email.validate('foo@foo.com')
          .then(() => {
            return test.expect(true).to.be.true()
          })
      })

      test.it('should encode the user password using md5', () => {
        const fooPassword = 'foo-password'
        model = user.Model(baseMocks.stubs.service)
        test.expect(model.password.set(fooPassword)).to.equal(md5(fooPassword))
      })
    })
  })
})
