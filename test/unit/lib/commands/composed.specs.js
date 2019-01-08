
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
    let serviceCommandsMocks
    let logCommandsMocks
    let servicePluginConfigCommandMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()
      userCommandsMocks = new mocks.commands.User()
      securityTokenCommandsMocks = new mocks.commands.SecurityToken()
      abilityCommandsMocks = new mocks.commands.Ability()
      serviceCommandsMocks = new mocks.commands.Service()
      servicePluginConfigCommandMocks = new mocks.commands.ServicePluginConfig()
      logCommandsMocks = new mocks.commands.Log()

      commands = composed.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs, {
        user: userCommandsMocks.stubs.commands,
        securityToken: securityTokenCommandsMocks.stubs.commands,
        ability: abilityCommandsMocks.stubs.commands,
        service: serviceCommandsMocks.stubs.commands,
        log: logCommandsMocks.stubs.commands,
        servicePluginConfig: servicePluginConfigCommandMocks.stubs.commands
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
      serviceCommandsMocks.restore()
      logCommandsMocks.restore()
      servicePluginConfigCommandMocks.restore()
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
        test.it('should call to add a new security token for service registerer', () => {
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
        _service: 'foo-service-id'
      }
      const fooService = {
        _id: 'foo-service-id'
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

      test.it('should call to send action, passing service data, ability data and action data', () => {
        abilityCommandsMocks.stubs.commands.validateAction.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

        return commands.dispatchAbilityAction('foo-id', fooActionData)
          .then(() => {
            return test.expect(clientMocks.stubs.sendAction).to.have.been.calledWith(fooService, fooAbility, fooActionData)
          })
      })

      test.it('should call to log add command passing ability data and action data', () => {
        abilityCommandsMocks.stubs.commands.validateAction.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

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
        _service: 'foo-service-id'
      }
      const fooService = {
        _id: 'foo-service-id'
      }

      test.it('should call to ability validateState command', () => {
        abilityCommandsMocks.stubs.commands.validateState.resolves(fooAbility)
        return commands.getAbilityState('foo-id')
          .then(() => {
            return test.expect(abilityCommandsMocks.stubs.commands.validateState).to.have.been.calledWith('foo-id')
          })
      })

      test.it('should call to get state, passing service data and ability data', () => {
        abilityCommandsMocks.stubs.commands.validateState.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

        return commands.getAbilityState('foo-id')
          .then(() => {
            return test.expect(clientMocks.stubs.getState).to.have.been.calledWith(fooService, fooAbility)
          })
      })
    })

    test.describe('triggerAbilityEvent method', () => {
      const fooAbility = {
        _id: 'foo-ability-id',
        _service: 'foo-service-id'
      }
      const fooService = {
        _id: 'foo-service-id'
      }
      const fooEventData = {
        data: 'foo-data'
      }

      test.it('should call to ability validateEvent command', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(abilityCommandsMocks.stubs.commands.validateEvent).to.have.been.calledWith('foo-id', fooEventData)
          })
      })

      test.it('should call to get related service, passing ability data', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(serviceCommandsMocks.stubs.commands.getById).to.have.been.calledWith(fooAbility._service)
          })
      })

      test.it('should call to log add command passing ability data and event data', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)

        return commands.triggerAbilityEvent('foo-id', fooEventData)
          .then(() => {
            return test.expect(logCommandsMocks.stubs.commands.add).to.have.been.calledWith({
              _ability: fooAbility._id,
              type: 'event',
              data: fooEventData.data
            })
          })
      })

      test.it('should trace data as an empty string if not received', () => {
        abilityCommandsMocks.stubs.commands.validateEvent.resolves(fooAbility)
        serviceCommandsMocks.stubs.commands.getById.resolves(fooService)
        return commands.triggerAbilityEvent('foo-id', {})
          .then(() => {
            return test.expect(baseMocks.stubs.service.tracer.debug.getCall(0).args[0]).to.include('Data: ""')
          })
      })
    })

    test.describe('getServiceOwner method', () => {
      const fooService = {
        name: 'foo-service-name',
        _id: 'foo-id'
      }
      test.describe('when received user is anonymous', () => {
        const fooUser = {
          name: 'foo-user-name',
          _id: 'foo-id'
        }

        test.beforeEach(() => {
          userCommandsMocks.stubs.commands.get.resolves(fooUser)
        })

        test.it('should call to get user with same name than service', () => {
          return commands.getServiceOwner({
            name: 'anonymous'
          }, fooService).then(() => {
            return test.expect(userCommandsMocks.stubs.commands.get).to.have.been.calledWith({
              name: fooService.name
            })
          })
        })

        test.it('should return user with same name than service', () => {
          return commands.getServiceOwner({
            name: 'anonymous'
          }, fooService).then(result => {
            return test.expect(result).to.equal(fooUser)
          })
        })
      })

      test.describe('when received user is not anonymous', () => {
        test.it('should return received user data', () => {
          const fooUser = {
            name: 'foo-user-name',
            _id: 'foo-id'
          }
          return commands.getServiceOwner(fooUser, fooService).then(result => {
            return test.expect(result).to.equal(fooUser)
          })
        })
      })
    })

    test.describe('getAbilityOwner method', () => {
      const fooAbility = {
        name: 'foo-ability-name',
        _id: 'foo-ability-id',
        _service: 'foo-service-id'
      }

      test.describe('when received user is anonymous', () => {
        const fooService = {
          name: 'foo-service-name',
          _id: 'foo-service-id',
          _user: 'foo-user-id'
        }
        test.beforeEach(() => {
          serviceCommandsMocks.stubs.commands.getById.resolves(fooService)
        })

        test.it('should call to get service with same id than received _service', () => {
          return commands.getAbilityOwner({
            name: 'anonymous'
          }, fooAbility).then(() => {
            return test.expect(serviceCommandsMocks.stubs.commands.getById).to.have.been.calledWith(fooAbility._service)
          })
        })

        test.it('should return the id of the user owner of the received _service', () => {
          return commands.getAbilityOwner({
            name: 'anonymous'
          }, fooAbility).then(result => {
            return test.expect(result).to.deep.equal({
              _id: fooService._user
            })
          })
        })
      })

      test.describe('when received user is not anonymous', () => {
        test.it('should return received user data', () => {
          const fooUser = {
            name: 'foo-user-name',
            _id: 'foo-id'
          }
          return commands.getAbilityOwner(fooUser, fooAbility).then(result => {
            return test.expect(result).to.equal(fooUser)
          })
        })
      })
    })

    test.describe('removeService method', () => {
      test.it('should call to remove service, servicePluginConfigs and abilities', () => {
        const fooId = 'foo-id'
        return commands.removeService(fooId).then(() => {
          return Promise.all([
            test.expect(serviceCommandsMocks.stubs.commands.remove).to.have.been.calledWith(fooId),
            test.expect(servicePluginConfigCommandMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooId
            }),
            test.expect(abilityCommandsMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooId
            })
          ])
        })
      })
    })

    test.describe('removeUser method', () => {
      const fooId = 'foo-id'
      const fooUserServices = [
        {
          _id: 'foo-service-id-1'
        },
        {
          _id: 'foo-service-id-2'
        }
      ]
      test.beforeEach(() => {
        serviceCommandsMocks.stubs.commands.getFiltered.resolves(fooUserServices)
      })

      test.it('should call to remove user and user securityTokens', () => {
        return commands.removeUser(fooId).then(() => {
          return Promise.all([
            test.expect(userCommandsMocks.stubs.commands.remove).to.have.been.calledWith({
              _id: fooId
            }),
            test.expect(securityTokenCommandsMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _user: fooId
            })
          ])
        })
      })

      test.it('should call to remove all services that belongs to user', () => {
        return commands.removeUser(fooId).then(() => {
          return Promise.all([
            test.expect(serviceCommandsMocks.stubs.commands.getFiltered).to.have.been.calledWith({
              _user: fooId
            }),
            test.expect(serviceCommandsMocks.stubs.commands.remove).to.have.been.calledWith(fooUserServices[0]._id),
            test.expect(servicePluginConfigCommandMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooUserServices[0]._id
            }),
            test.expect(abilityCommandsMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooUserServices[0]._id
            }),
            test.expect(serviceCommandsMocks.stubs.commands.remove).to.have.been.calledWith(fooUserServices[1]._id),
            test.expect(servicePluginConfigCommandMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooUserServices[1]._id
            }),
            test.expect(abilityCommandsMocks.stubs.commands.findAndRemove).to.have.been.calledWith({
              _service: fooUserServices[1]._id
            })
          ])
        })
      })
    })
  })
})
