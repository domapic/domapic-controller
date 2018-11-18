
const test = require('narval')

const mocks = require('../../mocks')

const abilities = require('../../../../lib/api/abilities')
const definition = require('../../../../lib/api/abilities.json')

test.describe('abilities api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks
    let eventsMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      eventsMocks = new mocks.Events()
      operations = abilities.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
      eventsMocks.restore()
    })

    test.describe('getAbilities handler', () => {
      test.it('should return all abilities if no query is received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.ability.getFiltered.resolves(fooResult)

        return operations.getAbilities.handler({
          query: {}
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.ability.getFiltered).to.have.been.calledWith({})
            ])
          })
      })

      test.it('should pass service query as a filter if it is received', () => {
        const fooService = 'foo-service'
        return operations.getAbilities.handler({
          query: {
            service: fooService
          }
        }).then(() => test.expect(commandsMocks.stubs.ability.getFiltered).to.have.been.calledWith({
          _service: fooService
        }))
      })
    })

    test.describe('getAbility handler', () => {
      test.it('should return ability, calling to correspondant command', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.ability.getById.resolves(fooResult)

        return operations.getAbility.handler({
          path: {
            id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.ability.getById).to.have.been.calledWith(fooId)
            ])
          })
      })
    })

    test.describe('addAbility auth', () => {
      test.it('should return true if provided user has "module" role', () => {
        test.expect(operations.addAbility.auth({
          role: 'module'
        }, {}, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addAbility.auth({
            role
          }, {}, {})).to.be.false()
        })
      }
      testRole('admin')
      testRole('service-registerer')
      testRole('operator')
      testRole('plugin')
    })

    test.describe('addAbility handler', () => {
      const fooAbility = {
        _id: 'foo-id',
        name: 'foo-name'
      }
      const fooBody = {
        name: 'foo'
      }
      const fooUserData = {
        _id: 'foo-user-id'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.ability.add.resolves(fooAbility)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add ability, passing the received user data and body', () => {
        return operations.addAbility.handler({}, fooBody, response, fooUserData)
          .then((result) => {
            return test.expect(commandsMocks.stubs.ability.add).to.have.been.calledWith(fooUserData, fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addAbility.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the ability id', () => {
        return operations.addAbility.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/abilities/foo-id')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.addAbility.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('ability', 'created', fooAbility)
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addAbility.handler({}, fooBody, response, fooUserData)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('updateAbility auth', () => {
      const fooUserId = 'foo-user-id'
      const fooParams = {
        path: {
          _id: 'foo-ability-id'
        }
      }

      test.it('should resolve if logged user is owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.updateAbility.auth({
          _id: fooUserId
        }, fooParams, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject if logged user is not owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.updateAbility.auth({
          _id: 'another-user-id'
        }, fooParams, {}).then(() => {
          return test.assert.fail()
        }, (error) => {
          return test.expect(error).to.be.an.instanceof(Error)
        })
      })
    })

    test.describe('updateAbility handler', () => {
      const fooId = 'foo-ability-id'
      const fooBody = {
        description: 'foo-description'
      }
      const fooAbility = {
        ...fooBody,
        _id: fooId,
        name: 'ability-name'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.ability.update.resolves(fooAbility)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to update ability, passing the received id and body', () => {
        return operations.updateAbility.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.ability.update).to.have.been.calledWith(fooId, fooBody)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.updateAbility.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should set the response header with the ability id', () => {
        return operations.updateAbility.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/abilities/foo-ability-id')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.updateAbility.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('ability', 'updated', fooAbility)
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.updateAbility.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('deleteAbility auth', () => {
      const fooUserId = 'foo-user-id'
      const fooParams = {
        path: {
          _id: 'foo-ability-id'
        }
      }

      test.it('should resolve if logged user is owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.deleteAbility.auth({
          _id: fooUserId
        }, fooParams, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject if logged user is not owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.deleteAbility.auth({
          _id: 'another-user-id'
        }, fooParams, {}).then(() => {
          return test.assert.fail()
        }, (error) => {
          return test.expect(error).to.be.an.instanceof(Error)
        })
      })
    })

    test.describe('deleteAbility handler', () => {
      const fooId = 'foo-ability-id'
      const fooAbility = {
        _id: fooId,
        name: 'ability-name'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub()
        }
        commandsMocks.stubs.ability.remove.resolves(fooAbility)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to delete ability, passing the received id', () => {
        return operations.deleteAbility.handler({
          path: {
            id: fooId
          }
        }, {}, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.ability.remove).to.have.been.calledWith(fooId)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.deleteAbility.handler({
          path: {
            id: fooId
          }
        }, {}, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.deleteAbility.handler({
          path: {
            id: fooId
          }
        }, {}, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('ability', 'deleted', {
              _id: fooId
            })
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.deleteAbility.handler({
          path: {
            id: fooId
          }
        }, {}, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('abilityAction handler', () => {
      const fooId = 'foo-ability-id'
      const fooActionData = {
        data: 'foo-data'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.composed.dispatchAbilityAction.resolves()
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call dispatch ability action, passing the received id', () => {
        return operations.abilityAction.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(commandsMocks.stubs.composed.dispatchAbilityAction).to.have.been.calledWith(fooId, fooActionData)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.abilityAction.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the correspondant ability state uri', () => {
        return operations.abilityAction.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/abilities/foo-ability-id/state')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.abilityAction.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('ability', 'action', {
              _id: fooId,
              ...fooActionData
            })
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.abilityAction.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('getState handler', () => {
      const fooId = 'foo-ability-id'

      test.it('should call get ability state, passing the received id', () => {
        return operations.abilityState.handler({
          path: {
            id: fooId
          }
        }).then(() => {
          return test.expect(commandsMocks.stubs.composed.getAbilityState).to.have.been.calledWith(fooId)
        })
      })
    })

    test.describe('abilityEvent auth', () => {
      const fooUserId = 'foo-user-id'
      const fooParams = {
        path: {
          _id: 'foo-ability-id'
        }
      }

      test.it('should resolve if logged user is owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.abilityEvent.auth({
          _id: fooUserId
        }, fooParams, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject if logged user is not owner of the ability', () => {
        commandsMocks.stubs.ability.getById.resolves({
          _user: fooUserId
        })

        return operations.abilityEvent.auth({
          _id: 'another-user-id'
        }, fooParams, {}).then(() => {
          return test.assert.fail()
        }, (error) => {
          return test.expect(error).to.be.an.instanceof(Error)
        })
      })
    })

    test.describe('abilityEvent handler', () => {
      const fooId = 'foo-ability-id'
      const fooActionData = {
        data: 'foo-data'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.composed.triggerAbilityEvent.resolves()
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to trigger ability event, passing the received id and body', () => {
        return operations.abilityEvent.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(commandsMocks.stubs.composed.triggerAbilityEvent).to.have.been.calledWith(fooId, fooActionData)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.abilityEvent.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the correspondant ability state uri', () => {
        return operations.abilityEvent.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/abilities/foo-ability-id/state')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.abilityEvent.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('ability', 'event', {
              _id: fooId,
              ...fooActionData
            })
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.abilityEvent.handler({
          path: {
            id: fooId
          }
        }, fooActionData, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(abilities.openapi()).to.deep.equal([definition])
    })
  })
})
