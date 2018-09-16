
const test = require('narval')

const services = require('../../../../lib/api/services')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getServices: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    addService: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(services, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(services, 'openapi').returns([])
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
