
const test = require('narval')

const modules = require('../../../../lib/api/modules')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getModules: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    addModule: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    getModule: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    updateModule: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(modules, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(modules, 'openapi').returns([])
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
