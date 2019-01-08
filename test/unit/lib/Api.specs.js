
const test = require('narval')
const _ = require('lodash')

const mocks = require('../mocks')

const Api = require('../../../lib/Api')

test.describe('Api', () => {
  let baseMocks
  let usersMocks
  let servicesMocks
  let securityTokensMocks
  let logMocks
  let api

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    usersMocks = new mocks.api.Users()
    securityTokensMocks = new mocks.api.SecurityTokens()
    servicesMocks = new mocks.api.Services()
    logMocks = new mocks.api.Logs()
    api = Api(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    usersMocks.restore()
    servicesMocks.restore()
    securityTokensMocks.restore()
    logMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('openapis property', () => {
      test.it('should be an array', () => {
        return test.expect(_.isArray(api.openapis)).to.be.true()
      })
    })

    test.describe('operations property', () => {
      test.it('should contain all api operations', () => {
        return test.expect(api.operations).to.have.all.keys(
          'getUsers',
          'addUser',
          'getUser',
          'getUserMe',
          'getSecurityTokens',
          'getServices',
          'getService',
          'addService',
          'updateService',
          'getServicePluginConfigs',
          'getServicePluginConfig',
          'addServicePluginConfig',
          'updateServicePluginConfig',
          'deleteServicePluginConfig',
          'getAbilities',
          'getAbility',
          'updateAbility',
          'addAbility',
          'deleteAbility',
          'abilityAction',
          'abilityState',
          'abilityEvent',
          'getLogs'
        )
      })
    })
  })
})
