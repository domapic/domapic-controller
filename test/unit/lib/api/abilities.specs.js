
const test = require('narval')

const mocks = require('../../mocks')

const abilities = require('../../../../lib/api/abilities')
const definition = require('../../../../lib/api/abilities.json')

test.describe('abilities api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = abilities.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
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
        commandsMocks.stubs.ability.get.resolves(fooResult)

        return operations.getAbility.handler({
          path: {
            id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.ability.get).to.have.been.calledWith({
                _id: fooId
              })
            ])
          })
      })
    })

    test.describe('addAbility handler', () => {
      const fooAbility = {
        _id: 'foo-id',
        name: 'foo-name'
      }
      const fooBody = {
        name: 'foo'
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

      test.it('should call to add ability, passing the received body', () => {
        return operations.addAbility.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.ability.add).to.have.been.calledWith(fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addAbility.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the ability id', () => {
        return operations.addAbility.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/abilities/foo-id')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addAbility.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
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
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(abilities.openapi()).to.deep.equal([definition])
    })
  })
})
