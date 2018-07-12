
const test = require('narval')

const domapicBase = require('domapic-base')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const serviceStubs = {
    server: {
      start: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    service: serviceStubs,
    cli: sandbox.stub(domapicBase, 'cli'),
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
