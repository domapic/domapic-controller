
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
      const fooServiceData = {
        name: 'foo-user-name',
        description: 'foo-description',
        _user: 'foo-user-id'
      }
      test.it('should create and save a Service model with the received data', () => {
        return commands.add(fooServiceData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Service).to.have.been.calledWith(fooServiceData),
              test.expect(modelsMocks.stubs.service.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new service', () => {
        return commands.add(fooServiceData)
          .then(service => {
            return test.expect(modelsMocks.stubs.service).to.equal(service)
          })
      })

      test.it('should call to transform the received error if saving service fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.service.save.rejects(saveError)
        utilMocks.stubs.transformValidationErrors.rejects(saveError)
        return commands.add(fooServiceData)
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
  })
})
