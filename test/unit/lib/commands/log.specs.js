
const test = require('narval')

const mocks = require('../../mocks')

const log = require('../../../../lib/commands/log')

test.describe('log commands', () => {
  test.describe('Commands instance', () => {
    let commands
    let modelsMocks
    let clientMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()

      commands = log.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
    })

    test.describe('add method', () => {
      const fooLogData = {
        _ability: 'foo ability'
      }

      test.it('should create and save a Log model with the received data', () => {
        return commands.add(fooLogData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Log).to.have.been.calledWith(fooLogData),
              test.expect(modelsMocks.stubs.log.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new log', () => {
        return commands.add(fooLogData)
          .then((log) => {
            return test.expect(modelsMocks.stubs.log).to.equal(log)
          })
      })
    })

    test.describe('getAll method', () => {
      test.it('should call to log model find method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Log.find.resolves(fooResult)
        return commands.getAll()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Log.find).to.have.been.called()
            ])
          })
      })
    })
  })
})
