const test = require('narval')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    sendAction: sandbox.stub().usingPromise().resolves(),
    getState: sandbox.stub().usingPromise().resolves(),
    sendEvent: sandbox.stub().usingPromise().resolves()
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
