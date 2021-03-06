
const test = require('narval')

const mocks = require('../mocks')

const Commands = require('../../../lib/Commands')

test.describe('Commands', () => {
  let baseMocks
  let modelsMocks
  let clientMocks
  let commands

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    modelsMocks = new mocks.Models()
    clientMocks = new mocks.Client()
    commands = Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    modelsMocks.restore()
    clientMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain all user commands', () => {
      return test.expect(commands.user).to.have.all.keys(
        'add',
        'getAll',
        'getFiltered',
        'get',
        'getById',
        'update',
        'init',
        'remove'
      )
    })

    test.it('should contain all securityToken commands', () => {
      return test.expect(commands.securityToken).to.have.all.keys(
        'add',
        'getUser',
        'getFiltered',
        'remove',
        'get',
        'findAndRemove'
      )
    })

    test.it('should contain all composed commands', () => {
      return test.expect(commands.composed).to.have.all.keys(
        'initUsers',
        'dispatchAbilityAction',
        'getAbilityState',
        'triggerAbilityEvent',
        'getServiceOwner',
        'getAbilityOwner',
        'removeService',
        'removeUser'
      )
    })

    test.it('should contain all service commands', () => {
      return test.expect(commands.service).to.have.all.keys(
        'add',
        'getFiltered',
        'get',
        'getById',
        'update',
        'remove'
      )
    })

    test.it('should contain all servicePluginConfig commands', () => {
      return test.expect(commands.servicePluginConfig).to.have.all.keys(
        'add',
        'getFiltered',
        'get',
        'getById',
        'update',
        'remove',
        'findAndRemove'
      )
    })

    test.it('should contain all ability commands', () => {
      return test.expect(commands.ability).to.have.all.keys(
        'add',
        'getFiltered',
        'get',
        'getById',
        'update',
        'remove',
        'validateAction',
        'validateState',
        'validateEvent',
        'findAndRemove'
      )
    })

    test.it('should contain all log commands', () => {
      return test.expect(commands.log).to.not.be.undefined()
    })
  })
})
