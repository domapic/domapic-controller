const test = require('narval')

const mocks = require('../../mocks')

const service = require('../../../../lib/models/service')

test.describe('service model', () => {
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
      test.it('should call to validate that name is unique', () => {
        model = service.Model(baseMocks.stubs.service)
        const fooDuplicatedError = new Error('foo duplicated error')
        utilsMocks.stubs.validateUniqueModel.rejects(fooDuplicatedError)
        return model.name.validate('foo-name')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooDuplicatedError)
          })
      })

      test.it('should throw an error if name validation returns false', () => {
        utilsMocks.stubs.isValidName.returns(false)
        model = service.Model(baseMocks.stubs.service)
        return model.name.validate('Foo')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err.message).to.include('Name must contain only')
          })
      })

      test.it('should not throw an error if name validation returns true', () => {
        utilsMocks.stubs.isValidName.returns(true)
        model = service.Model(baseMocks.stubs.service)
        return Promise.all([
          model.name.validate('foo-name_123-foo2'),
          model.name.validate('javier.brea')
        ])
      })
    })

    test.describe('url validation', () => {
      test.it('should call to validate that url is unique', () => {
        model = service.Model(baseMocks.stubs.service)
        const fooDuplicatedError = new Error('foo duplicated error')
        utilsMocks.stubs.validateUniqueModel.rejects(fooDuplicatedError)
        return model.url.validate('http://foo.com')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooDuplicatedError)
          })
      })

      test.it('should throw an error if provided url is not valid', () => {
        model = service.Model(baseMocks.stubs.service)
        return model.url.validate('foo')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err.message).to.contain('is not a valid url')
          })
      })

      test.it('should not throw an error if provided url is valid', () => {
        model = service.Model(baseMocks.stubs.service)
        return model.url.validate('http://www.foo.com')
      })

      test.it('should not throw an error if provided url is a valid IP', () => {
        model = service.Model(baseMocks.stubs.service)
        return model.url.validate('https://192.168.1.100:3400')
      })
    })
  })
})
