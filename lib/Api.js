'use strict'

const users = require('./api/users')

const Api = function (service, commands) {
  return {
    openapis: [
      ...users.openapi()
    ],
    operations: {
      ...users.Operations(service, commands)
    }
  }
}

module.exports = Api
