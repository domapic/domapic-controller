const test = require('narval')

const UserCommands = require('./commands/User.mocks')
const RefreshTokenCommands = require('./commands/RefreshToken.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userCommandsMocks = new UserCommands()
  const refreshTokenMocks = new RefreshTokenCommands()

  const stubs = {
    user: userCommandsMocks.stubs.commands,
    refreshToken: refreshTokenMocks.stubs.commands
  }

  const restore = function () {
    userCommandsMocks.restore()
    refreshTokenMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
