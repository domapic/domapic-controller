
const test = require('narval')

const mocks = require('../../mocks')

const modules = require('../../../../lib/api/modules')
const definition = require('../../../../lib/api/modules.json')

test.describe('modules api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = modules.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getModules handler', () => {
      test.it('should return all modules', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.module.getFiltered.resolves(fooResult)

        return operations.getModules.handler()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.module.getFiltered).to.have.been.calledWith()
            ])
          })
      })
    })

    test.describe('getModule handler', () => {
      test.it('should return module, calling to correspondant command', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.module.getById.resolves(fooResult)

        return operations.getModule.handler({
          path: {
            id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.module.getById).to.have.been.calledWith(fooId)
            ])
          })
      })
    })

    test.describe('addModule auth', () => {
      const fooId = 'foo-id'
      test.it('should return true if provided user has "module" role', () => {
        test.expect(operations.addModule.auth({
          role: 'module'
        }, {}, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addModule.auth({
            _id: fooId
          }, {}, {})).to.be.false()
        })
      }
      testRole('admin')
      testRole('operator')
      testRole('plugin')
      testRole('service-registerer')
    })

    test.describe('addModule handler', () => {
      const fooUserData = {
        _id: 'foo-user-id'
      }
      const fooModule = {
        _id: 'foo-module-id',
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
        commandsMocks.stubs.module.add.resolves(fooModule)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add module, passing the received body and user data', () => {
        return operations.addModule.handler({}, fooBody, response, fooUserData)
          .then((result) => {
            return test.expect(commandsMocks.stubs.module.add).to.have.been.calledWith(fooUserData, fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addModule.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the new module id', () => {
        return operations.addModule.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/modules/foo-module-id')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addModule.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('updateModule auth', () => {
      const fooUserId = 'foo-user-id'
      const fooParams = {
        path: {
          id: 'foo-module-id'
        }
      }

      test.it('should resolve if logged user is owner of the module', () => {
        commandsMocks.stubs.module.getById.resolves({
          _user: fooUserId
        })

        return operations.updateModule.auth({
          _id: fooUserId
        }, fooParams, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject if logged user is not owner of the module', () => {
        commandsMocks.stubs.module.getById.resolves({
          _user: fooUserId
        })

        return operations.updateModule.auth({
          _id: 'another-user-id'
        }, fooParams, {}).then(() => {
          return test.assert.fail()
        }, (error) => {
          return test.expect(error).to.be.an.instanceof(Error)
        })
      })
    })

    test.describe('updateModule handler', () => {
      const fooId = 'foo-module-id'
      const fooBody = {
        description: 'foo-description'
      }
      const fooModule = {
        _id: 'foo-module-id',
        name: 'foo-module-name'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.module.update.resolves(fooModule)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to update module, passing the received name and body', () => {
        return operations.updateModule.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.module.update).to.have.been.calledWith(fooId, fooBody)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.updateModule.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should set the response header with the module name', () => {
        return operations.updateModule.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/modules/foo-module-id')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.updateModule.handler({
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
      test.expect(modules.openapi()).to.deep.equal([definition])
    })
  })
})
