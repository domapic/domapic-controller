const test = require('narval')

const UserCommands = require('./commands/User.mocks')
const SecurityTokenCommands = require('./commands/SecurityToken.mocks')
const ComposedCommands = require('./commands/Composed.mocks')
const ServiceCommands = require('./commands/Service.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userCommandsMocks = new UserCommands()
  const securityTokenMocks = new SecurityTokenCommands()
  const composedMocks = new ComposedCommands()
  const serviceMocks = new ServiceCommands()

  const stubs = {
    user: userCommandsMocks.stubs.commands,
    securityToken: securityTokenMocks.stubs.commands,
    composed: composedMocks.stubs.commands,
    service: serviceMocks.stubs.commands
  }

  const restore = function () {
    composedMocks.restore()
    userCommandsMocks.restore()
    securityTokenMocks.restore()
    serviceMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
