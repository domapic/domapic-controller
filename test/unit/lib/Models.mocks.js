const test = require('narval')

const UserModel = require('./models/User.mocks')
const SecurityTokenModel = require('./models/SecurityToken.mocks')
const ServiceModel = require('./models/Service.mocks')
const AbilityModel = require('./models/Ability.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userModelMocks = new UserModel()
  const securityTokenMocks = new SecurityTokenModel()
  const serviceModelMocks = new ServiceModel()
  const abilityModelMocks = new AbilityModel()

  const stubs = {
    user: userModelMocks.stubs.user,
    User: userModelMocks.stubs.User,
    securityToken: securityTokenMocks.stubs.securityToken,
    SecurityToken: securityTokenMocks.stubs.SecurityToken,
    service: serviceModelMocks.stubs.service,
    Service: serviceModelMocks.stubs.Service,
    ability: abilityModelMocks.stubs.ability,
    Ability: abilityModelMocks.stubs.Ability
  }

  const restore = function () {
    serviceModelMocks.restore()
    userModelMocks.restore()
    securityTokenMocks.restore()
    abilityModelMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
