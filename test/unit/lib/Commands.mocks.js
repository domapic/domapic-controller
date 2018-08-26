const test = require('narval')

const UserCommands = require('./commands/User.mocks')
const SecurityTokenCommands = require('./commands/SecurityToken.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userCommandsMocks = new UserCommands()
  const securityTokenMocks = new SecurityTokenCommands()

  const stubs = {
    user: userCommandsMocks.stubs.commands,
    securityToken: securityTokenMocks.stubs.commands
  }

  const restore = function () {
    userCommandsMocks.restore()
    securityTokenMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
