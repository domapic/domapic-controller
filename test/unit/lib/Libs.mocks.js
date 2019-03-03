
const test = require('narval')

const libs = require('../../../lib/libs')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const socketIoInstance = {
    on: sandbox.stub()
  }

  const stubs = {
    socketIo: sandbox.stub(libs, 'socketIo').returns(socketIoInstance),
    socketIoAuth: sandbox.stub(libs, 'socketIoAuth').returns(true),
    ipRangeCheck: sandbox.stub(libs, 'ipRangeCheck').returns(true)
  }

  stubs.socketIo.instance = socketIoInstance

  const restore = function () {
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
