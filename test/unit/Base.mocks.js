
const test = require('narval')

const domapicBase = require('domapic-base')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const connectionStub = {
    post: sandbox.stub().usingPromise().resolves(),
    get: sandbox.stub().usingPromise().resolves()
  }

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
      error: sandbox.stub().usingPromise().resolves(),
      warn: sandbox.stub().usingPromise().resolves()
    },
    errors: {
      BadData: sandbox.stub().returns(new Error()),
      NotFound: sandbox.stub().returns(new Error()),
      MethodNotAllowed: sandbox.stub().returns(new Error()),
      Forbidden: sandbox.stub().returns(new Error()),
      Conflict: sandbox.stub().returns(new Error()),
      ClientTimeOut: sandbox.stub().returns(new Error()),
      ServerUnavailable: sandbox.stub().returns(new Error()),
      BadGateway: sandbox.stub().returns(new Error())
    },
    client: {
      Connection: sandbox.stub().returns(connectionStub),
      connection: connectionStub
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
