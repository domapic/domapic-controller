
const test = require('narval')

const abilities = require('../../../../lib/api/abilities')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const operationsStubs = {
    getAbilities: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    addAbility: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    getAbility: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    updateAbility: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    deleteAbility: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    abilityAction: {
      handler: sandbox.stub().usingPromise().resolves()
    },
    abilityState: {
      handler: sandbox.stub().usingPromise().resolves()
    }
  }

  const stubs = {
    operations: operationsStubs,
    Operations: sandbox.stub(abilities, 'Operations').returns(operationsStubs),
    openapi: sandbox.stub(abilities, 'openapi').returns([])
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
