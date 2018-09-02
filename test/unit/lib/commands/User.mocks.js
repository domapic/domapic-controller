
const test = require('narval')

const user = require('../../../../lib/commands/user')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    add: sandbox.stub().usingPromise().resolves(),
    getAll: sandbox.stub().usingPromise().resolves(),
    getById: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves(),
    remove: sandbox.stub().usingPromise().resolves(),
    init: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(user, 'Commands').returns(commandsStubs)
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
