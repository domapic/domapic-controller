
const test = require('narval')

const securityToken = require('../../../../lib/commands/securityToken')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    add: sandbox.stub().usingPromise().resolves(),
    getUser: sandbox.stub().usingPromise().resolves(),
    getFiltered: sandbox.stub().usingPromise().resolves(),
    remove: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves(),
    findAndRemove: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(securityToken, 'Commands').returns(commandsStubs)
  }

  const restore = function () {
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
