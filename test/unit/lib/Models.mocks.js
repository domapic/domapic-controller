const test = require('narval')

const UserModel = require('./models/User.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userModelMocks = new UserModel()

  const stubs = {
    user: userModelMocks.stubs.user,
    User: userModelMocks.stubs.User
  }

  const restore = function () {
    userModelMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
