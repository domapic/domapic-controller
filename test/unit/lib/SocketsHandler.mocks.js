const test = require('narval')

const socketsHandler = require('../../../lib/socketsHandler')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    init: sandbox.stub(socketsHandler, 'init').resolves()
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
