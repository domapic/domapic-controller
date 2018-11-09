
const test = require('narval')

const serviceModel = require('../../../../lib/models/module')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const moduleStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const ModuleStub = sandbox.stub().returns(moduleStub)
  ModuleStub.find = sandbox.stub().usingPromise().resolves()
  ModuleStub.findOne = sandbox.stub().usingPromise().resolves()
  ModuleStub.findById = sandbox.stub().usingPromise().resolves()
  ModuleStub.findOneAndUpdate = sandbox.stub().usingPromise().resolves()

  const stubs = {
    module: moduleStub,
    Module: ModuleStub,
    Model: sandbox.stub(serviceModel, 'Model').returns(ModuleStub)
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
