
const test = require('narval')

const mocks = require('../../mocks')

const servicePluginConfigs = require('../../../../lib/api/servicePluginConfigs')
const definition = require('../../../../lib/api/servicePluginConfigs.json')

test.describe('servicePluginConfigs api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks
    let eventsMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = servicePluginConfigs.Operations(baseMocks.stubs.service, commandsMocks.stubs)
      eventsMocks = new mocks.Events()
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
      eventsMocks.restore()
    })

    test.describe('getServicePluginConfigs handler', () => {
      test.it('should return all servicePluginConfigs', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.servicePluginConfig.getFiltered.resolves(fooResult)

        return operations.getServicePluginConfigs.handler({query: {}})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.servicePluginConfig.getFiltered).to.have.been.calledWith()
            ])
          })
      })

      test.it('should pass received query data to get services plugin configs command', () => {
        const fooResult = 'foo result'
        const fooQuery = {
          service: 'foo-service',
          'plugin-package-name': 'foo-package-name'
        }
        commandsMocks.stubs.servicePluginConfig.getFiltered.resolves(fooResult)

        return operations.getServicePluginConfigs.handler({query: fooQuery})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.servicePluginConfig.getFiltered).to.have.been.calledWith({
                _service: 'foo-service',
                pluginPackageName: 'foo-package-name'
              })
            ])
          })
      })
    })

    test.describe('getServicePluginConfig handler', () => {
      test.it('should return servicePluginConfig, calling to correspondant command', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.servicePluginConfig.getById.resolves(fooResult)

        return operations.getServicePluginConfig.handler({
          path: {
            id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.servicePluginConfig.getById).to.have.been.calledWith(fooId)
            ])
          })
      })
    })

    const testWriteAuth = function (operation) {
      test.describe(`${operation} auth`, () => {
        const fooUserId = 'foo-user-id'
        const fooParams = {
          path: {
            id: 'foo-service-plugin-config-id'
          }
        }

        test.beforeEach(() => {
          commandsMocks.stubs.servicePluginConfig.getById.resolves({
            _service: 'foo-service-id'
          })
          commandsMocks.stubs.service.getById.resolves({
            _user: fooUserId
          })
        })

        test.it('should return true if provided user has "admin" role', () => {
          return operations[operation].auth({
            role: 'admin'
          }, fooParams, {}).then(() => {
            return test.expect(true).to.be.true()
          })
        })

        test.it('should return true if provided user has "plugin" role', () => {
          return operations[operation].auth({
            role: 'plugin'
          }, fooParams, {}).then(() => {
            return test.expect(true).to.be.true()
          })
        })

        test.it('should resolve if logged user is owner of the service', () => {
          return operations[operation].auth({
            _id: fooUserId
          }, fooParams, {}).then(() => {
            return test.expect(true).to.be.true()
          })
        })

        test.it('should reject if logged user is not owner of the service', () => {
          commandsMocks.stubs.service.getById.resolves({
            _user: 'another-user-id'
          })

          return operations[operation].auth({
            _id: fooUserId
          }, fooParams, {}).then(() => {
            return test.assert.fail()
          }, (error) => {
            return test.expect(error).to.be.an.instanceof(Error)
          })
        })
      })
    }

    testWriteAuth('addServicePluginConfig')
    testWriteAuth('updateServicePluginConfig')
    testWriteAuth('deleteServicePluginConfig')

    test.describe('addServicePluginConfig auth', () => {
      test.it('should call to check the service owner with the provided service in body', () => {
        const fooUserId = 'foo-id'
        commandsMocks.stubs.service.getById.resolves({
          _user: fooUserId
        })
        return operations.addServicePluginConfig.auth({
          _id: fooUserId
        }, {}, {
          _service: 'foo'
        }).then(() => {
          return test.expect(commandsMocks.stubs.service.getById).to.have.been.calledWith('foo')
        })
      })
    })

    test.describe('updateServicePluginConfig auth', () => {
      test.it('should call check the service owner with existant service in plugin config', () => {
        const fooUserId = 'foo-id'
        const fooServiceId = 'foo-service-id'
        commandsMocks.stubs.servicePluginConfig.getById.resolves({
          _service: fooServiceId
        })
        commandsMocks.stubs.service.getById.resolves({
          _user: fooUserId
        })
        return operations.updateServicePluginConfig.auth({
          _id: fooUserId
        }, {
          path: {
            id: 'foo-id'
          }
        }, {
        }).then(() => {
          return Promise.all([
            test.expect(commandsMocks.stubs.servicePluginConfig.getById).to.have.been.calledWith('foo-id'),
            test.expect(commandsMocks.stubs.service.getById).to.have.been.calledWith(fooServiceId)
          ])
        })
      })
    })

    test.describe('addServicePluginConfig handler', () => {
      const fooServicePluginConfig = {
        _id: 'foo-service-plugin-config-id',
        _service: 'foo-service',
        pluginPackageName: 'foo-package-name'
      }
      const fooBody = {
        _service: 'foo-service',
        pluginPackageName: 'foo-package-name',
        config: {
          foo: 'foo-data'
        }
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.servicePluginConfig.add.resolves(fooServicePluginConfig)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add service plugin config, passing the received body', () => {
        return operations.addServicePluginConfig.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.servicePluginConfig.add).to.have.been.calledWith(fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addServicePluginConfig.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the new servicePluginConfig id', () => {
        return operations.addServicePluginConfig.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/service-plugin-configs/foo-service-plugin-config-id')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.addServicePluginConfig.handler({}, fooBody, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('servicePluginConfig', 'created', fooServicePluginConfig)
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addServicePluginConfig.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('updateServicePluginConfig handler', () => {
      const fooId = 'foo-service-plugin-config-id'
      const fooBody = {
        config: {
          foo: 'foo-config'
        }
      }
      const fooServicePluginConfig = {
        _id: fooId,
        _service: 'foo-service-id',
        pluginPackageName: 'foo-plugin-package-name'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.servicePluginConfig.update.resolves(fooServicePluginConfig)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to update servicePluginConfig, passing the received name and body', () => {
        return operations.updateServicePluginConfig.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.servicePluginConfig.update).to.have.been.calledWith(fooId, fooBody)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.updateServicePluginConfig.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should set the response header with the servicePluginConfig id', () => {
        return operations.updateServicePluginConfig.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/service-plugin-configs/foo-service-plugin-config-id')
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.updateServicePluginConfig.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('servicePluginConfig', 'updated', fooServicePluginConfig)
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.updateServicePluginConfig.handler({
          path: {
            id: fooId
          }
        }, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })

    test.describe('deleteServicePluginConfig handler', () => {
      const fooId = 'foo-service-plugin-config-id'
      const fooParams = {
        path: {
          id: fooId
        }
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.servicePluginConfig.remove.resolves()
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to update servicePluginConfig, passing the received name and body', () => {
        return operations.deleteServicePluginConfig.handler(fooParams, null, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.servicePluginConfig.remove).to.have.been.calledWith(fooId)
          })
      })

      test.it('should add a 204 header to response', () => {
        return operations.deleteServicePluginConfig.handler(fooParams, null, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(204)
          })
      })

      test.it('should emit a plugin event', () => {
        return operations.deleteServicePluginConfig.handler(fooParams, null, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('servicePluginConfig', 'deleted', {
              _id: fooId
            })
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.deleteServicePluginConfig.handler(fooParams, null, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(servicePluginConfigs.openapi()).to.deep.equal([definition])
    })
  })
})
