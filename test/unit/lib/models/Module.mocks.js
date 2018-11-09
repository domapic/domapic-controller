
const test = require('narval')

const service = require('../../../../lib/models/module')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const serviceStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const ServiceStub = sandbox.stub().returns(serviceStub)
  ServiceStub.find = sandbox.stub().usingPromise().resolves()
  ServiceStub.findOne = sandbox.stub().usingPromise().resolves()
  ServiceStub.findById = sandbox.stub().usingPromise().resolves()
  ServiceStub.findOneAndUpdate = sandbox.stub().usingPromise().resolves()

  const stubs = {
    service: serviceStub,
    Service: ServiceStub,
    Model: sandbox.stub(service, 'Model').returns(ServiceStub)
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
