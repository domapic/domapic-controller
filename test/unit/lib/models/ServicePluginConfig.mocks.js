
const test = require('narval')

const model = require('../../../../lib/models/servicePluginConfig')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const modelStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const ModelStub = sandbox.stub().returns(modelStub)
  ModelStub.find = sandbox.stub().usingPromise().resolves()
  ModelStub.findOne = sandbox.stub().usingPromise().resolves()
  ModelStub.findById = sandbox.stub().usingPromise().resolves()
  ModelStub.findOneAndUpdate = sandbox.stub().usingPromise().resolves()
  ModelStub.findOneAndRemove = sandbox.stub().usingPromise().resolves()
  ModelStub.deleteMany = sandbox.stub().usingPromise().resolves()

  const stubs = {
    servicePluginConfig: modelStub,
    ServicePluginConfig: ModelStub,
    Model: sandbox.stub(model, 'Model').returns(ModelStub)
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
