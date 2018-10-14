
const test = require('narval')

const composed = require('../../../../lib/commands/composed')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    initUsers: sandbox.stub().usingPromise().resolves(),
    dispatchAbilityAction: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(composed, 'Commands').returns(commandsStubs)
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
