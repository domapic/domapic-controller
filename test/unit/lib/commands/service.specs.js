
const test = require('narval')

const mocks = require('../../mocks')

const service = require('../../../../lib/commands/service')

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

      commands = service.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      utilMocks.restore()
    })

    test.describe('add method', () => {
      const fooUser = {
        _id: 'foo-user-id',
        name: 'foo-user-name'
      }
      const fooServiceData = {
        description: 'foo-description'
      }
      test.it('should create and save a Service model with the received data, adding the received user data', () => {
        return commands.add(fooUser, fooServiceData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Service).to.have.been.calledWith({
                ...fooServiceData,
                name: fooUser.name,
                _user: fooUser._id
              }),
              test.expect(modelsMocks.stubs.service.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new service', () => {
        return commands.add(fooUser, fooServiceData)
          .then(service => {
            return test.expect(modelsMocks.stubs.service).to.equal(service)
          })
      })

      test.it('should call to transform the received error if saving service fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.service.save.rejects(saveError)
        utilMocks.stubs.transformValidationErrors.rejects(saveError)
        return commands.add(fooUser, fooServiceData)
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
        _user: 'foo-id'
      }
      const fooServices = [{
        token: 'foo'
      }]

      test.it('should call to find services and return the result', () => {
        modelsMocks.stubs.Service.find.resolves(fooServices)
        return commands.getFiltered(fooFilter)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooServices),
              test.expect(modelsMocks.stubs.Service.find).to.have.been.calledWith(fooFilter)
            ])
          })
      })

      test.it('should call to find services with an empty filter if it is not provided', () => {
        modelsMocks.stubs.Service.find.resolves(fooServices)
        return commands.getFiltered()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooServices),
              test.expect(modelsMocks.stubs.Service.find).to.have.been.calledWith({})
            ])
          })
      })
    })

    test.describe('get method', () => {
      test.it('should call to service model findOne method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Service.findOne.resolves(fooResult)
        return commands.get({_id: 'id'})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Service.findOne).to.have.been.called()
            ])
          })
      })

      test.it('should call to service model get method with an empty object if it is not provided, and return the result', () => {
        const fooResult = []
        modelsMocks.stubs.Service.findOne.resolves(fooResult)
        return commands.get()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Service.findOne.getCall(0).args[0]).to.deep.equal({})
            ])
          })
      })

      test.it('should return a not found error if no service is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Service.findOne.resolves(null)
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
      test.it('should call to service model findById method, and return the result', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.Service.findById.resolves(fooResult)
        return commands.getById(fooId)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Service.findById).to.have.been.calledWith(fooId, 'name processId description package _user version url updatedAt createdAt')
            ])
          })
      })

      test.it('should not filter fields if allFields option is received', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.Service.findById.resolves(fooResult)
        return commands.getById(fooId, {
          allFields: true
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Service.findById).to.have.been.calledWith(fooId, undefined)
            ])
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Service.findById.rejects(new Error())
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
      const fooData = {description: 'foo-description'}

      test.it('should call to service model findOneAndUpdate method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Service.findOneAndUpdate.resolves(fooResult)
        return commands.update(fooId, fooData)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Service.findOneAndUpdate).to.have.been.calledWith({
                _id: fooId
              }, fooData)
            ])
          })
      })

      test.it('should call to transform the received error if updating service fails', () => {
        let updateError = new Error('update error')
        modelsMocks.stubs.Service.findOneAndUpdate.rejects(updateError)
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
        modelsMocks.stubs.Service.findOneAndUpdate.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })
  })
})
