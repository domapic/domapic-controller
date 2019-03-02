
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
              test.expect(result).to.equal(fooResult)
            ])
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
