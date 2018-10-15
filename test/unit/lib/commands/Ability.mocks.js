
const test = require('narval')

const ability = require('../../../../lib/commands/ability')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    add: sandbox.stub().usingPromise().resolves(),
    getFiltered: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves(),
    getById: sandbox.stub().usingPromise().resolves(),
    update: sandbox.stub().usingPromise().resolves(),
    remove: sandbox.stub().usingPromise().resolves(),
    validateAction: sandbox.stub().usingPromise().resolves(),
    validateState: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(ability, 'Commands').returns(commandsStubs)
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
