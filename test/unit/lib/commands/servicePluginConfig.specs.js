
const test = require('narval')

const mocks = require('../../mocks')

const servicePluginConfig = require('../../../../lib/commands/servicePluginConfig')

test.describe('service commands', () => {
  test.describe('Commands instance', () => {
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()

      commands = servicePluginConfig.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      utilMocks.restore()
    })

    test.describe('add method', () => {
      const fooServicePluginConfigData = {
        _service: 'foo-service-id',
        pluginPackageName: 'foo-domapic-plugin',
        config: {
          foo: 'foo-config'
        }
      }

      test.beforeEach(() => {
        modelsMocks.stubs.Service.findById.resolves({})
      })

      test.it('should reject if provided _service does not exist', () => {
        modelsMocks.stubs.Service.findById.rejects(new Error())
        return commands.add(fooServicePluginConfigData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(err).to.be.an.instanceOf(Error),
              test.expect(baseMocks.stubs.service.errors.BadData).to.have.been.called()
            ])
          })
      })

      test.it('should create and save a ServicePluginConfig model with the received data, adding an unique id', () => {
        return commands.add(fooServicePluginConfigData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.ServicePluginConfig).to.have.been.calledWith({
                ...fooServicePluginConfigData,
                uniqueId: `${fooServicePluginConfigData._service}_${fooServicePluginConfigData.pluginPackageName}`
              }),
              test.expect(modelsMocks.stubs.servicePluginConfig.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new servicePluginConfig', () => {
        return commands.add(fooServicePluginConfigData)
          .then(servicePluginConfig => {
            return test.expect(modelsMocks.stubs.servicePluginConfig).to.equal(servicePluginConfig)
          })
      })

      test.it('should call to transform the received error if saving service fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.servicePluginConfig.save.rejects(saveError)
        utilMocks.stubs.transformValidationErrors.rejects(saveError)
        return commands.add(fooServicePluginConfigData)
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return Promise.all([
              test.expect(err).to.equal(saveError),
              test.expect(utilMocks.stubs.transformValidationErrors).to.have.been.calledWith(saveError)
            ])
          })
      })
    })

    test.describe('getFiltered method', () => {
      const fooFilter = {
        pluginPackageName: 'foo-package'
      }
      const fooResults = [{
        _service: 'foo'
      }]

      test.it('should call to find servicePluginConfigs and return the result', () => {
        modelsMocks.stubs.ServicePluginConfig.find.resolves(fooResults)
        return commands.getFiltered(fooFilter)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResults),
              test.expect(modelsMocks.stubs.ServicePluginConfig.find).to.have.been.calledWith(fooFilter)
            ])
          })
      })

      test.it('should call to find servicePluginConfigs with an empty filter if it is not provided', () => {
        modelsMocks.stubs.ServicePluginConfig.find.resolves(fooResults)
        return commands.getFiltered()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResults),
              test.expect(modelsMocks.stubs.ServicePluginConfig.find).to.have.been.calledWith({})
            ])
          })
      })

      test.it('should not filter fields if allFields option is received', () => {
        modelsMocks.stubs.ServicePluginConfig.find.resolves(fooResults)
        return commands.getFiltered({}, {
          allFields: true
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResults),
              test.expect(modelsMocks.stubs.ServicePluginConfig.find).to.have.been.calledWith({}, undefined)
            ])
          })
      })
    })

    test.describe('get method', () => {
      test.it('should call to servicePluginConfig model findOne method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.findOne.resolves(fooResult)
        return commands.get({_id: 'id'})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.ServicePluginConfig.findOne).to.have.been.called()
            ])
          })
      })

      test.it('should call to servicePluginConfig model get method with an empty object if it is not provided, and return the result', () => {
        const fooResult = []
        modelsMocks.stubs.ServicePluginConfig.findOne.resolves(fooResult)
        return commands.get()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.ServicePluginConfig.findOne.getCall(0).args[0]).to.deep.equal({})
            ])
          })
      })

      test.it('should return a not found error if no servicePluginConfig is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.ServicePluginConfig.findOne.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.get({
          _id: 'foo'
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('getById method', () => {
      test.it('should call to servicePluginConfig model findById method, and return the result', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.findById.resolves(fooResult)
        return commands.getById(fooId)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.ServicePluginConfig.findById).to.have.been.calledWith(fooId, '_service pluginPackageName config updatedAt createdAt')
            ])
          })
      })

      test.it('should not filter fields if allFields option is received', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.findById.resolves(fooResult)
        return commands.getById(fooId, {
          allFields: true
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.ServicePluginConfig.findById).to.have.been.calledWith(fooId, undefined)
            ])
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.ServicePluginConfig.findById.rejects(new Error())
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.getById('foo-id')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('update method', () => {
      const fooId = 'foo-id'
      const fooData = {config: {
        foo: 'foo-config'
      }}

      test.it('should call to service model findOneAndUpdate method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.findOneAndUpdate.resolves(fooResult)
        return commands.update(fooId, fooData)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.ServicePluginConfig.findOneAndUpdate).to.have.been.calledWith({
                _id: fooId
              }, fooData)
            ])
          })
      })

      test.it('should call to transform the received error if updating service fails', () => {
        let updateError = new Error('update error')
        modelsMocks.stubs.ServicePluginConfig.findOneAndUpdate.rejects(updateError)
        utilMocks.stubs.transformValidationErrors.rejects(updateError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return Promise.all([
              test.expect(err).to.equal(updateError),
              test.expect(utilMocks.stubs.transformValidationErrors).to.have.been.calledWith(updateError)
            ])
          })
      })

      test.it('should return a not found error if no service is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.ServicePluginConfig.findOneAndUpdate.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('remove method', () => {
      const fooId = 'foo-id'

      test.it('should call to servicePluginConfig model findOneAndRemove method', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.findOneAndRemove.resolves(fooResult)
        return commands.remove(fooId)
          .then((result) => {
            return test.expect(modelsMocks.stubs.ServicePluginConfig.findOneAndRemove).to.have.been.calledWith({
              _id: fooId
            })
          })
      })

      test.it('should return a not found error if no servicePluginConfig is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.ServicePluginConfig.findOneAndRemove.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.remove(fooId)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('findAndRemove method', () => {
      const fooFilter = {
        _id: 'foo-id'
      }

      test.it('should call to servicePluginConfig model deleteMany method', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.ServicePluginConfig.deleteMany.resolves(fooResult)
        return commands.findAndRemove(fooFilter)
          .then((result) => {
            return test.expect(modelsMocks.stubs.ServicePluginConfig.deleteMany).to.have.been.calledWith(fooFilter)
          })
      })
    })
  })
})
