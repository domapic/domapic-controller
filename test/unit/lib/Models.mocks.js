const test = require('narval')

const UserModel = require('./models/User.mocks')
const SecurityTokenModel = require('./models/SecurityToken.mocks')
const ModuleModel = require('./models/Module.mocks')
const AbilityModel = require('./models/Ability.mocks')
const LogModel = require('./models/Log.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userModelMocks = new UserModel()
  const securityTokenMocks = new SecurityTokenModel()
  const serviceModelMocks = new ModuleModel()
  const abilityModelMocks = new AbilityModel()
  const logModelMocks = new LogModel()

  const stubs = {
    user: userModelMocks.stubs.user,
    User: userModelMocks.stubs.User,
    securityToken: securityTokenMocks.stubs.securityToken,
    SecurityToken: securityTokenMocks.stubs.SecurityToken,
    service: serviceModelMocks.stubs.service,
    Service: serviceModelMocks.stubs.Service,
    ability: abilityModelMocks.stubs.ability,
    Ability: abilityModelMocks.stubs.Ability,
    log: logModelMocks.stubs.log,
    Log: logModelMocks.stubs.Log
  }

  const restore = function () {
    serviceModelMocks.restore()
    userModelMocks.restore()
    securityTokenMocks.restore()
    abilityModelMocks.restore()
    logModelMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
