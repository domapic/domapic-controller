
const test = require('narval')

const securityToken = require('../../../../lib/models/securityToken')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const securityTokenStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const SecurityTokenStub = sandbox.stub().returns(securityTokenStub)
  SecurityTokenStub.findOne = sandbox.stub().usingPromise().resolves()
  SecurityTokenStub.find = sandbox.stub().usingPromise().resolves()
  SecurityTokenStub.deleteOne = sandbox.stub().usingPromise().resolves()
  SecurityTokenStub.deleteMany = sandbox.stub().usingPromise().resolves()

  const stubs = {
    securityToken: securityTokenStub,
    SecurityToken: SecurityTokenStub,
    Model: sandbox.stub(securityToken, 'Model').returns(SecurityTokenStub)
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
