
const test = require('narval')

const composed = require('../../../../lib/commands/composed')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    initUsers: sandbox.stub().usingPromise().resolves(),
    dispatchAbilityAction: sandbox.stub().usingPromise().resolves(),
    getAbilityState: sandbox.stub().usingPromise().resolves(),
    triggerAbilityEvent: sandbox.stub().usingPromise().resolves(),
    getServiceOwner: sandbox.stub().usingPromise().resolves(),
    getAbilityOwner: sandbox.stub().usingPromise().resolves(),
    removeService: sandbox.stub().usingPromise().resolves(),
    removeUser: sandbox.stub().usingPromise().resolves()
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
