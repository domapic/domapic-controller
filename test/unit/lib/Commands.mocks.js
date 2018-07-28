const test = require('narval')

const UserCommands = require('./commands/User.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userCommandsMocks = new UserCommands()

  const stubs = {
    user: userCommandsMocks.stubs.commands
  }

  const restore = function () {
    userCommandsMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
