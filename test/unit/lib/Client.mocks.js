const test = require('narval')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
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
