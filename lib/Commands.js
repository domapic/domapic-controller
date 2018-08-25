'use strict'

const user = require('./commands/user')
const refreshToken = require('./commands/refreshToken')

const Commands = (service, models, client) => ({
  user: user.Commands(service, models, client),
  refreshToken: refreshToken.Commands(service, models, client)
})

module.exports = Commands
