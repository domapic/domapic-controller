
const test = require('narval')

const domapicBase = require('domapic-base')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const serviceStubs = {
    server: {
      addAuthentication: sandbox.stub().usingPromise().resolves(),
      addOperations: sandbox.stub().usingPromise().resolves(),
      extendOpenApi: sandbox.stub().usingPromise().resolves(),
      start: sandbox.stub().usingPromise().resolves()
    },
    config: {
      get: sandbox.stub().usingPromise().resolves()
    },
    tracer: {
      info: sandbox.stub().usingPromise().resolves(),
      debug: sandbox.stub().usingPromise().resolves(),
      error: sandbox.stub().usingPromise().resolves()
    },
    errors: {
      BadData: sandbox.stub().returns(new Error()),
      NotFound: sandbox.stub().returns(new Error()),
      MethodNotAllowed: sandbox.stub().returns(new Error()),
      Forbidden: sandbox.stub().returns(new Error()),
      Conflict: sandbox.stub().returns(new Error())
    }
  }

  const stubs = {
    service: serviceStubs,
    cli: sandbox.stub(domapicBase, 'cli').usingPromise().resolves(),
    Service: sandbox.stub(domapicBase, 'Service').usingPromise().resolves(serviceStubs)
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
