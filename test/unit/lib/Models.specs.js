const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let userModelMocks
  let securityTokenModelMocks
  let serviceModelMocks
  let servicePluginConfigModelMocks
  let abilityModelMocks
  let logModelMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    userModelMocks = new mocks.models.User()
    securityTokenModelMocks = new mocks.models.SecurityToken()
    serviceModelMocks = new mocks.models.Service()
    servicePluginConfigModelMocks = new mocks.models.ServicePluginConfig()
    abilityModelMocks = new mocks.models.Ability()
    logModelMocks = new mocks.models.Log()
    models = Models(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    userModelMocks.restore()
    serviceModelMocks.restore()
    servicePluginConfigModelMocks.restore()
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

    test.it('should contain Service model', () => {
      return test.expect(typeof models.Service).to.equal('function')
    })

    test.it('should contain ServicePluginConfig model', () => {
      return test.expect(typeof models.ServicePluginConfig).to.equal('function')
    })

    test.it('should contain Ability model', () => {
      return test.expect(typeof models.Ability).to.equal('function')
    })

    test.it('should contain Log model', () => {
      return test.expect(typeof models.Log).to.equal('function')
    })
  })
})
