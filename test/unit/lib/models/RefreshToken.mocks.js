
const test = require('narval')

const refreshToken = require('../../../../lib/models/refreshToken')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const refreshTokenStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const RefreshTokenStub = sandbox.stub().returns(refreshTokenStub)
  RefreshTokenStub.findOne = sandbox.stub().usingPromise().resolves()
  RefreshTokenStub.deleteOne = sandbox.stub().usingPromise().resolves()

  const stubs = {
    refreshToken: refreshTokenStub,
    RefreshToken: RefreshTokenStub,
    Model: sandbox.stub(refreshToken, 'Model').returns(RefreshTokenStub)
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
