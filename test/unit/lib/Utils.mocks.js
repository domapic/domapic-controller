
const test = require('narval')

const utils = require('../../../lib/utils')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const validateUniqueModelStub = sandbox.stub().usingPromise.resolves()

  const stubs = {
    transformValidationErrors: sandbox.stub(utils, 'transformValidationErrors').usingPromise().resolves(),
    validateUniqueModel: validateUniqueModelStub,
    ValidateUniqueModel: sandbox.stub(utils, 'ValidateUniqueModel').returns(validateUniqueModelStub)
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
