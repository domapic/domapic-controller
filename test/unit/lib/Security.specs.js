
const test = require('narval')

const mocks = require('../mocks')

const Security = require('../../../lib/Security')

test.describe('Security', () => {
  let baseMocks
  let commandsMocks
  let security

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    security = Security(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('methods property', () => {
      test.it.skip('should be an object', () => {
        return test.expect(security.methods).to.deep.equal({})
      })
    })
  })
})
