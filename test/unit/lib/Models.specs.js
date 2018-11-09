const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let userModelMocks
  let securityTokenModelMocks
  let moduleModelMocks
  let abilityModelMocks
  let logModelMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    userModelMocks = new mocks.models.User()
    securityTokenModelMocks = new mocks.models.SecurityToken()
    moduleModelMocks = new mocks.models.Module()
    abilityModelMocks = new mocks.models.Ability()
    logModelMocks = new mocks.models.Log()
    models = Models(baseMocks.stubs.module)
  })

  test.afterEach(() => {
    baseMocks.restore()
    userModelMocks.restore()
    moduleModelMocks.restore()
    securityTokenModelMocks.restore()
    abilityModelMocks.restore()
    logModelMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain User model', () => {
      return test.expect(typeof models.User).to.equal('function')
    })

    test.it('should contain SecurityToken model', () => {
      return test.expect(typeof models.SecurityToken).to.equal('function')
    })

    test.it('should contain Module model', () => {
      return test.expect(typeof models.Module).to.equal('function')
    })

    test.it('should contain Ability model', () => {
      return test.expect(typeof models.Ability).to.equal('function')
    })

    test.it('should contain Log model', () => {
      return test.expect(typeof models.Log).to.equal('function')
    })
  })
})
