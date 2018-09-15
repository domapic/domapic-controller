'use strict'

const users = require('./api/users')
const securityTokens = require('./api/securityTokens')

const Api = (service, commands) => ({
  openapis: [
    ...users.openapi(),
    ...securityTokens.openapi()
  ],
  operations: {
    ...users.Operations(service, commands),
    ...securityTokens.Operations(service, commands)
  }
})

module.exports = Api
