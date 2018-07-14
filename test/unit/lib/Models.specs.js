const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    models = new Models(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should be an object', () => {
      return test.expect(models).to.deep.equal({})
    })
  })
})
