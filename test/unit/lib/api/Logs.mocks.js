
const test = require('narval')

const logs = require('../../../../lib/api/logs')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getLogs: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(logs, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(logs, 'openapi').returns([])
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
