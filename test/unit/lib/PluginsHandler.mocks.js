const test = require('narval')

const pluginsHandler = require('../../../lib/pluginsHandler')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    init: sandbox.stub(pluginsHandler, 'init').resolves()
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
