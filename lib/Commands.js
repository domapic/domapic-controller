'use strict'

const user = require('./commands/user')

const Commands = function (service, models, client) {
  return {
    user: user.Commands(service, models, client)
  }
}

module.exports = Commands
