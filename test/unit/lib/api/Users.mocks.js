
const test = require('narval')

const users = require('../../../../lib/api/users')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getUsers: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    addUser: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(users, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(users, 'openapi').returns({})
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
