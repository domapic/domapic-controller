
const test = require('narval')
const _ = require('lodash')

const mocks = require('../mocks')

const Client = require('../../../lib/Client')

test.describe('Client', () => {
  let baseMocks
  let client

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    client = Client(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should be an object', () => {
      return test.expect(_.isObject(client)).to.be.true()
    })

    test.it('should contain all client operations', () => {
      return test.expect(client).to.have.all.keys(
        'sendAction'
      )
    })
  })
})
