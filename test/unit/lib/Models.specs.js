const test = require('narval')

const mocks = require('../mocks')

const Models = require('../../../lib/Models')

test.describe('Models', () => {
  let baseMocks
  let userModelMocks
  let refreshTokenModelMocks
  let models

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    userModelMocks = new mocks.models.User()
    refreshTokenModelMocks = new mocks.models.RefreshToken()
    models = Models(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    userModelMocks.restore()
    refreshTokenModelMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain User model', () => {
      return test.expect(typeof models.User).to.equal('function')
    })

    test.it('should contain RefreshToken model', () => {
      return test.expect(typeof models.RefreshToken).to.equal('function')
    })
  })
})
