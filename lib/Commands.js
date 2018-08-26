'use strict'

const user = require('./commands/user')
const securityToken = require('./commands/securityToken')

const Commands = (service, models, client) => ({
  user: user.Commands(service, models, client),
  securityToken: securityToken.Commands(service, models, client)
})

module.exports = Commands
