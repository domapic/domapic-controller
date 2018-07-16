const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let userModelMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    userModelMocks = new mocks.models.User()
    models = new Models(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    userModelMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain User model', () => {
      return test.expect(typeof models.User).to.equal('function')
    })
  })
})
