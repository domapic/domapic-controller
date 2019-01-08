
const test = require('narval')

const servicePluginConfigs = require('../../../../lib/api/servicePluginConfigs')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getServicePluginConfigs: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    addServicePluginConfig: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    getServicePluginConfig: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    updateServicePluginConfig: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    deleteServicePluginConfig: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(servicePluginConfigs, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(servicePluginConfigs, 'openapi').returns([])
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
