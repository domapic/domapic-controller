
const test = require('narval')

const user = require('../../../../lib/models/user')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const userStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const UserStub = sandbox.stub().returns(userStub)
  UserStub.findOne = sandbox.stub().usingPromise().resolves()
  UserStub.find = sandbox.stub().usingPromise().resolves()
  UserStub.findById = sandbox.stub().usingPromise().resolves()

  const stubs = {
    user: userStub,
    User: UserStub,
    Model: sandbox.stub(user, 'Model').returns(UserStub)
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
