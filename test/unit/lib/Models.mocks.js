const test = require('narval')

const UserModel = require('./models/User.mocks')
const RefreshTokenModel = require('./models/RefreshToken.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userModelMocks = new UserModel()
  const refreshTokenMocks = new RefreshTokenModel()

  const stubs = {
    user: userModelMocks.stubs.user,
    User: userModelMocks.stubs.User,
    refreshToken: refreshTokenMocks.stubs.refreshToken,
    RefreshToken: refreshTokenMocks.stubs.RefreshToken
  }

  const restore = function () {
    userModelMocks.restore()
    refreshTokenMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
