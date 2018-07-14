
const test = require('narval')

const mocks = require('../mocks')

const Client = require('../../../lib/Client')

test.describe('Client', () => {
  let baseMocks
  let client

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    client = new Client(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should be an object', () => {
      return test.expect(client).to.deep.equal({})
    })
  })
})
