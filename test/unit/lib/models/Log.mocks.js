
const test = require('narval')

const log = require('../../../../lib/models/log')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const logStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const LogStub = sandbox.stub().returns(logStub)

  const stubs = {
    log: logStub,
    Log: LogStub,
    Model: sandbox.stub(log, 'Model').returns(LogStub)
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
