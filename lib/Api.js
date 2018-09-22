'use strict'

const users = require('./api/users')
const securityTokens = require('./api/securityTokens')
const services = require('./api/services')
const abilities = require('./api/abilities')

const Api = (service, commands) => ({
  openapis: [
    ...users.openapi(),
    ...securityTokens.openapi(),
    ...services.openapi(),
    ...abilities.openapi()
  ],
  operations: {
    ...users.Operations(service, commands),
    ...securityTokens.Operations(service, commands),
    ...services.Operations(service, commands),
    ...abilities.Operations(service, commands)
  }
})

module.exports = Api
