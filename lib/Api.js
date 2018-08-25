'use strict'

const users = require('./api/users')

const Api = (service, commands) => ({
  openapis: [].concat(
    users.openapi()
  ),
  operations: {
    ...users.Operations(service, commands)
  }
})

module.exports = Api
