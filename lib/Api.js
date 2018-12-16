'use strict'

const users = require('./api/users')
const securityTokens = require('./api/securityTokens')
const services = require('./api/services')
const servicePluginConfigs = require('./api/servicePluginConfigs')
const abilities = require('./api/abilities')
const logs = require('./api/logs')

const Api = (service, commands) => ({
  openapis: [
    ...users.openapi(),
    ...securityTokens.openapi(),
    ...services.openapi(),
    ...servicePluginConfigs.openapi(),
    ...abilities.openapi(),
    ...logs.openapi()
  ],
  operations: {
    ...users.Operations(service, commands),
    ...securityTokens.Operations(service, commands),
    ...services.Operations(service, commands),
    ...servicePluginConfigs.Operations(service, commands),
    ...abilities.Operations(service, commands),
    ...logs.Operations(service, commands)
  }
})

module.exports = Api
