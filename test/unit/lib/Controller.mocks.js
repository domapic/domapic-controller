
const test = require('narval')

const controller = require('../../../lib/controller')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    start: sandbox.stub(controller, 'start').usingPromise().resolves()
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
