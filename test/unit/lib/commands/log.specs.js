
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
        modelsMocks.stubs.Log.findSort.resolves(fooResult)
        return commands.getAll()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Log.findSort).to.have.been.called()
            ])
          })
      })
    })

    test.describe('getPaginated method', () => {
      test.it('should call to log model find method skipping correspondant results and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Log.findSort.resolves(fooResult)
        return commands.getPaginated(2)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Log.find.getCall(0).args[2]).to.deep.equal({
                skip: 10,
                limit: 10
              })
            ])
          })
      })

      test.it('should pass received filter to find command', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Log.findSort.resolves(fooResult)
        return commands.getPaginated(2, {
          _ability: 'foo'
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Log.find.getCall(0).args[0]).to.deep.equal({
                _ability: 'foo'
              })
            ])
          })
      })
    })

    test.describe('getStats method', () => {
      test.it('should call to log model countDocument methods if receives a filter', () => {
        const fooResult = 4
        modelsMocks.stubs.Log.countDocuments.resolves(fooResult)
        return commands.getStats({
          _ability: 'foo'
        })
          .then((result) => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Log.countDocuments).to.have.been.called(),
              test.expect(result).to.deep.equal({
                total: fooResult
              })
            ])
          })
      })

      test.it('should call to log model estimatedDocumentCount method if does not receive a filter', () => {
        const fooResult = 4
        modelsMocks.stubs.Log.estimatedDocumentCount.returns(fooResult)
        return commands.getStats()
          .then((result) => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Log.estimatedDocumentCount).to.have.been.called(),
              test.expect(result).to.deep.equal({
                total: fooResult
              })
            ])
          })
      })
    })
  })
})
