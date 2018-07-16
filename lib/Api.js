'use strict'

const users = require('./api/users')

const Api = function (service, commands) {
  return {
    openapis: [].concat(
      users.openapi()
    ),
    operations: Object.assign({},
      users.Operations(service, commands)
    )
  }
}

module.exports = Api
