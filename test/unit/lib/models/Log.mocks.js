
const test = require('narval')

const log = require('../../../../lib/models/log')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const logStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const LogStub = sandbox.stub().returns(logStub)
  const findSort = sandbox.stub().usingPromise().resolves()
  LogStub.findSort = findSort
  LogStub.find = sandbox.stub().usingPromise().returns({
    sort: findSort
  })
  LogStub.countDocuments = sandbox.stub().usingPromise().resolves()
  LogStub.estimatedDocumentCount = sandbox.stub().returns(4)

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
