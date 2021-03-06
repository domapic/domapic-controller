const test = require('narval')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    connect: sandbox.stub().usingPromise().resolves(),
    disconnect: sandbox.stub().usingPromise().resolves()
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
