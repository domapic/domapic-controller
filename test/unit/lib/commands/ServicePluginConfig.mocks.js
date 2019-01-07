
const test = require('narval')

const servicePluginConfig = require('../../../../lib/commands/servicePluginConfig')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const commandsStubs = {
    add: sandbox.stub().usingPromise().resolves(),
    getFiltered: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves(),
    getById: sandbox.stub().usingPromise().resolves(),
    update: sandbox.stub().usingPromise().resolves(),
    findAndRemove: sandbox.stub().usingPromise().resolves()
  }

  const stubs = {
    commands: commandsStubs,
    Commands: sandbox.stub(servicePluginConfig, 'Commands').returns(commandsStubs)
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
