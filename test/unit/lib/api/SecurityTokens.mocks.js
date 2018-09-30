
const test = require('narval')

const securityTokens = require('../../../../lib/api/securityTokens')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getSecurityTokens: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(securityTokens, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(securityTokens, 'openapi').returns([])
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
