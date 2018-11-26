const _ = require('lodash')
const test = require('narval')

const mocks = require('../../mocks')

const ability = require('../../../../lib/models/ability')

test.describe('ability model', () => {
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
      test.it('should throw an error if name validation returns false', () => {
        utilsMocks.stubs.isValidAbilityName.returns(false)
        model = ability.Model(baseMocks.stubs.service)
        return model.name.validate('Foo')
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err.message).to.include('Name must contain only')
          })
      })

      test.it('should not throw an error if name validation returns true', () => {
        utilsMocks.stubs.isValidAbilityName.returns(true)
        model = ability.Model(baseMocks.stubs.service)
        return Promise.all([
          model.name.validate('foo-name_123-foo2'),
          model.name.validate('javier.brea')
        ])
      })
    })

    test.describe('type', () => {
      const testValidation = function (key) {
        test.it(`should be required if ability has ${key}`, () => {
          model = ability.Model(baseMocks.stubs.service)
          test.expect(model.type.required[0].bind({
            [key]: true
          })()).to.equal(true)
        })
      }
      const required = [
        'state',
        'format',
        'enum',
        'maxLength',
        'minLength',
        'pattern',
        'multipleOf',
        'minimum',
        'maximum',
        'exclusiveMaximum',
        'exclusiveMinimum'
      ]
      _.each(required, testValidation)

      test.it(`should not be required if ability has not any of that properties`, () => {
        model = ability.Model(baseMocks.stubs.service)
        test.expect(model.type.required[0].bind({
          event: true
        })()).to.equal(false)
      })
    })
  })
})
