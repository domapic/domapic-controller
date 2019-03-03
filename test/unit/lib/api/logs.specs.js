
const test = require('narval')

const mocks = require('../../mocks')

const logs = require('../../../../lib/api/logs')
const definition = require('../../../../lib/api/logs.json')

test.describe('logs api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = logs.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getLogs handler', () => {
      test.it('should return all logs, calling to correspondant command when no query is received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.log.getAll.resolves(fooResult)

        return operations.getLogs.handler({
          query: {}
        })
          .then((result) => {
            return Promise.all([
              test.expect(commandsMocks.stubs.log.getAll.getCall(0).args[0]).to.deep.equal({
              }),
              test.expect(result).to.equal(fooResult)
            ])
          })
      })

      test.it('should pass ability filter if received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.log.getAll.resolves(fooResult)

        return operations.getLogs.handler({
          query: {
            ability: 'foo'
          }
        })
          .then((result) => {
            return Promise.all([
              test.expect(commandsMocks.stubs.log.getAll.getCall(0).args[0]).to.deep.equal({
                _ability: 'foo'
              }),
              test.expect(result).to.equal(fooResult)
            ])
          })
      })

      test.it('should return paginated logs when it receives page filter', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.log.getPaginated.resolves(fooResult)

        return operations.getLogs.handler({
          query: {
            page: 1,
            ability: 'foo'
          }
        })
          .then((result) => {
            return Promise.all([
              test.expect(commandsMocks.stubs.log.getPaginated.getCall(0).args[1]).to.deep.equal({
                _ability: 'foo'
              }),
              test.expect(result).to.equal(fooResult)
            ])
          })
      })
    })

    test.describe('getLogs parameters parser', () => {
      test.it('should convert page parameter to number', () => {
        test.expect(operations.getLogs.parse.params.page('5')).to.deep.equal(5)
      })
    })

    test.describe('getLogsStats handler', () => {
      test.it('should return logs stats calling to correspondant command', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.log.getStats.resolves(fooResult)

        return operations.getLogsStats.handler({
          query: {}
        })
          .then((result) => {
            return test.expect(result).to.equal(fooResult)
          })
      })

      test.it('should pass ability filter if received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.log.getStats.resolves(fooResult)

        return operations.getLogsStats.handler({
          query: {
            ability: 'foo'
          }
        })
          .then((result) => {
            return test.expect(commandsMocks.stubs.log.getStats.getCall(0).args[0]).to.deep.equal({
              _ability: 'foo'
            })
          })
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(logs.openapi()).to.deep.equal([definition])
    })
  })
})
