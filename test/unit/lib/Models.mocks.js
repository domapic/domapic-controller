const test = require('narval')

const UserModel = require('./models/User.mocks')
const SecurityTokenModel = require('./models/SecurityToken.mocks')
const ServiceModel = require('./models/Service.mocks')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const userModelMocks = new UserModel()
  const securityTokenMocks = new SecurityTokenModel()
  const serviceModelMocks = new ServiceModel()

  const stubs = {
    user: userModelMocks.stubs.user,
    User: userModelMocks.stubs.User,
    securityToken: securityTokenMocks.stubs.securityToken,
    SecurityToken: securityTokenMocks.stubs.SecurityToken,
    service: serviceModelMocks.stubs.service,
    Service: serviceModelMocks.stubs.Service
  }

  const restore = function () {
    serviceModelMocks.restore()
    userModelMocks.restore()
    securityTokenMocks.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
