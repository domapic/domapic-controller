
const test = require('narval')

const domapicModule = require('../../../../lib/commands/module')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    add: sandbox.stub().usingPromise().resolves(),
    getFiltered: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves(),
    getById: sandbox.stub().usingPromise().resolves(),
    update: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(domapicModule, 'Commands').returns(commandsStubs)
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
