
const test = require('narval')

const mocks = require('../../mocks')

const composed = require('../../../../lib/commands/composed')

test.describe('composed commands', () => {
  test.describe('Commands instance', () => {
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks
    let userCommandsMocks
    let securityTokenCommandsMocks
    let abilityCommandsMocks
    let moduleCommandsMocks
    let logCommandsMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()
      userCommandsMocks = new mocks.commands.User()
      securityTokenCommandsMocks = new mocks.commands.SecurityToken()
      abilityCommandsMocks = new mocks.commands.Ability()
      moduleCommandsMocks = new mocks.commands.Module()
      logCommandsMocks = new mocks.commands.Log()

      commands = composed.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs, {
        user: userCommandsMocks.stubs.commands,
        securityToken: securityTokenCommandsMocks.stubs.commands,
        ability: abilityCommandsMocks.stubs.commands,
        module: moduleCommandsMocks.stubs.commands,
        log: logCommandsMocks.stubs.commands
      })
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      userCommandsMocks.restore()
      securityTokenCommandsMocks.restore()
      utilMocks.restore()
      abilityCommandsMocks.restore()
      moduleCommandsMocks.restore()
      logCommandsMocks.restore()
    })

    test.describe('initUsers method', () => {
      const fooRegistererUser = {
        _id: 'foo-registerer-user-id'
      }
      test.it('should call to init users command', () => {
        userCommandsMocks.stubs.commands.get.resolves({
          _id: 'foo'
        })
        return commands.initUsers()
          .then(() => {
            return test.expect(userCommandsMocks.stubs.commands.init).to.have.been.called()
          })
      })

      test.describe('when init users add users because database was empty', () => {
        test.it('should call to add a new security token for module registerer', () => {
          userCommandsMocks.stubs.commands.init.resolves([{
            _id: 'foo-user-id-1'
          }, fooRegistererUser])
          userCommandsMocks.stubs.commands.get.resolves(fooRegistererUser)
          return commands.initUsers()
            .then(() => {
              return test.expect(securityTokenCommandsMocks.stubs.commands.add).to.have.been.calledWith(fooRegistererUser, 'apiKey')
            })
        })
      })

      test.describe('when registerer user is not found', () => {
        test.it('should call to add registerer user', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.rejects(new Error())
          userCommandsMocks.stubs.commands.add.resolves(fooRegistererUser)
          return commands.initUsers()
            .then(() => {
              return test.expect(userCommandsMocks.stubs.commands.add).to.have.been.called()
            })
        })
      })

      test.describe('when registerer user security token is not found', () => {
        test.it('should call to add security token for registerer user', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.rejects(new Error())
          userCommandsMocks.stubs.commands.add.resolves(fooRegistererUser)
          securityTokenCommandsMocks.stubs.commands.get.rejects(new Error())
          return commands.initUsers()
            .then(() => {
              return test.expect(securityTokenCommandsMocks.stubs.commands.add).to.have.been.calledWith(fooRegistererUser, 'apiKey')
            })
        })
      })

      test.describe('when registerer user and security token are found', () => {
        test.it('should not call to add user, nor token', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.resolves(fooRegistererUser)
          securityTokenCommandsMocks.stubs.commands.get.resolves()
          return commands.initUsers()
            .then(() => {
              return Promise.all([
                test.expect(userCommandsMocks.stubs.commands.add).to.not.have.been.called(),
                test.expect(securityTokenCommandsMocks.stubs.commands.add).to.not.have.been.called()
              ])
            })
        })
      })
    })

    test.describe('dispatchAbilityAction method', () => {
      const fooAbility = {
        _id: 'foo-id',
        _module: 'foo-module-id'
      }
      const fooModule = {
        _id: 'foo-module-id'
      }
      const fooActionData = {
        data: 'foo-data'
      }

      test.it('should call to ability validateAction command', () => {
        abilityCommandsMocks.stubs.commands.validateAction.resolves(fooAbility)
        return commands.dispatchAbilityAction('foo-id', fooActionData)
          .then(() => {
            return test.expect(abilityCommandsMocks.stubs.commands.validateAction).to.have.been.calledWith('foo-id', fooActionData)
          })
      })

      test.it('should call to send action, passing module data, ability data and action data', () => {
        abilityCommandsMocks.stubs.commands.validateAction.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.dispatchAbilityAction('foo-id', fooActionData)
          .then(() => {
            return test.expect(clientMocks.stubs.sendAction).to.have.been.calledWith(fooModule, fooAbility, fooActionData)
          })
      })

      test.it('should call to log add command passing ability data and action data', () => {
        abilityCommandsMocks.stubs.commands.validateAction.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.dispatchAbilityAction('foo-id', fooActionData)
          .then(() => {
            return test.expect(logCommandsMocks.stubs.commands.add).to.have.been.calledWith({
              _ability: fooAbility._id,
              type: 'action',
              data: fooActionData.data
            })
          })
      })
    })

    test.describe('getAbilityState method', () => {
      const fooAbility = {
        _id: 'foo-id',
        _module: 'foo-module-id'
      }
      const fooModule = {
        _id: 'foo-module-id'
      }

      test.it('should call to ability validateState command', () => {
        abilityCommandsMocks.stubs.commands.validateState.resolves(fooAbility)
        return commands.getAbilityState('foo-id')
          .then(() => {
            return test.expect(abilityCommandsMocks.stubs.commands.validateState).to.have.been.calledWith('foo-id')
          })
      })

      test.it('should call to get state, passing module data and ability data', () => {
        abilityCommandsMocks.stubs.commands.validateState.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.getAbilityState('foo-id')
          .then(() => {
            return test.expect(clientMocks.stubs.getState).to.have.been.calledWith(fooModule, fooAbility)
          })
      })
    })

    test.describe('triggerAbilityEvent method', () => {
      const fooAbility = {
        _id: 'foo-ability-id',
        _module: 'foo-module-id'
      }
      const fooModule = {
        _id: 'foo-module-id'
      }
      const fooEventData = {
        data: 'foo-data'
      }

      test.it('should call to ability validateEvent command', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(abilityCommandsMocks.stubs.commands.validateEvent).to.have.been.calledWith('foo-id', fooEventData)
          })
      })

      test.it('should call to get related module, passing ability data', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(moduleCommandsMocks.stubs.commands.getById).to.have.been.calledWith(fooAbility._module)
          })
      })

      test.it('should call to log add command passing ability data and event data', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        moduleCommandsMocks.stubs.commands.getById.resolves(fooModule)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(logCommandsMocks.stubs.commands.add).to.have.been.calledWith({
              _ability: fooAbility._id,
              type: 'event',
              data: fooEventData.data
            })
          })
      })
    })
  })
})
