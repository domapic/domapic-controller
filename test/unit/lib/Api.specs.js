
const test = require('narval')

const mocks = require('../mocks')

const Api = require('../../../lib/Api')

test.describe('Api', () => {
  let baseMocks
  let api

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    api = new Api(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('openapi property', () => {
      test.it('should be an object', () => {
        return test.expect(api.openapi).to.deep.equal({})
      })
    })

    test.describe('operations property', () => {
      test.it('should be an object', () => {
        return test.expect(api.operations).to.deep.equal({})
      })
    })
  })
})
