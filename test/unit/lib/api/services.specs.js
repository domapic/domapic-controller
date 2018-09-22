
const test = require('narval')

const mocks = require('../../mocks')

const services = require('../../../../lib/api/services')
const definition = require('../../../../lib/api/services.json')

test.describe('services api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = services.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getServices handler', () => {
      test.it('should return all services', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.service.getFiltered.resolves(fooResult)

        return operations.getServices.handler()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.service.getFiltered).to.have.been.calledWith()
            ])
          })
      })
    })

    test.describe('getService handler', () => {
      test.it('should return service, calling to correspondant command', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.service.getById.resolves(fooResult)

        return operations.getService.handler({
          path: {
            _id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.service.getById).to.have.been.calledWith(fooId)
            ])
          })
      })
    })

    test.describe('addService auth', () => {
      const fooId = 'foo-id'
      test.it('should return true if provided user has "service" role', () => {
        test.expect(operations.addService.auth({
          role: 'service'
        }, {}, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addService.auth({
            _id: fooId
          }, {}, {})).to.be.false()
        })
      }
      testRole('admin')
      testRole('operator')
      testRole('plugin')
      testRole('service-registerer')
    })

    test.describe('addService handler', () => {
      const fooUserData = {
        _id: 'foo-user-id'
      }
      const fooService = {
        _id: 'foo-service-id',
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
        commandsMocks.stubs.service.add.resolves(fooService)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add service, passing the received body and user data', () => {
        return operations.addService.handler({}, fooBody, response, fooUserData)
          .then((result) => {
            return test.expect(commandsMocks.stubs.service.add).to.have.been.calledWith(fooUserData, fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addService.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the new service id', () => {
        return operations.addService.handler({}, fooBody, response, fooUserData)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/services/foo-service-id')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addService.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('updateService auth', () => {
      const fooUserId = 'foo-user-id'
      const fooParams = {
        path: {
          _id: 'foo-service-id'
        }
      }

      test.it('should resolve if logged user is owner of the service', () => {
        commandsMocks.stubs.service.getById.resolves({
          _user: fooUserId
        })

        return operations.updateService.auth({
          _id: fooUserId
        }, fooParams, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject if logged user is not owner of the service', () => {
        commandsMocks.stubs.service.getById.resolves({
          _user: fooUserId
        })

        return operations.updateService.auth({
          _id: 'another-user-id'
        }, fooParams, {}).then(() => {
          return test.assert.fail()
        }, (error) => {
          return test.expect(error).to.be.an.instanceof(Error)
        })
      })
    })

    test.describe('updateService handler', () => {
      const fooId = 'foo-service-id'
      const fooBody = {
        description: 'foo-description'
      }
      const fooService = {
        _id: 'foo-service-id',
        name: 'foo-service-name'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.service.update.resolves(fooService)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to update service, passing the received name and body', () => {
        return operations.updateService.handler({
          path: {
            _id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.service.update).to.have.been.calledWith(fooId, fooBody)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.updateService.handler({
          path: {
            _id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should set the response header with the service name', () => {
        return operations.updateService.handler({
          path: {
            _id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/services/foo-service-id')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.updateService.handler({
          path: {
            _id: fooId
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
      test.expect(services.openapi()).to.deep.equal([definition])
    })
  })
})
