
const test = require('narval')

const ability = require('../../../../lib/models/ability')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const abilityStub = {
    save: sandbox.stub().usingPromise().resolves()
  }

  const AbilityStub = sandbox.stub().returns(abilityStub)
  AbilityStub.find = sandbox.stub().usingPromise().resolves()
  AbilityStub.findOne = sandbox.stub().usingPromise().resolves()
  AbilityStub.findById = sandbox.stub().usingPromise().resolves()
  AbilityStub.findOneAndUpdate = sandbox.stub().usingPromise().resolves()
  AbilityStub.findOneAndRemove = sandbox.stub().usingPromise().resolves()
  AbilityStub.deleteMany = sandbox.stub().usingPromise().resolves()

  const stubs = {
    ability: abilityStub,
    Ability: AbilityStub,
    Model: sandbox.stub(ability, 'Model').returns(AbilityStub)
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
