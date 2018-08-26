const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let userModelMocks
  let securityTokenModelMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    userModelMocks = new mocks.models.User()
    securityTokenModelMocks = new mocks.models.SecurityToken()
    models = Models(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    userModelMocks.restore()
    securityTokenModelMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain User model', () => {
      return test.expect(typeof models.User).to.equal('function')
    })

    test.it('should contain SecurityToken model', () => {
      return test.expect(typeof models.SecurityToken).to.equal('function')
    })
  })
})
