
const test = require('narval')

const mongoose = require('mongoose')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const stubs = {
    connect: sandbox.stub(mongoose, 'connect').usingPromise().resolves()
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
