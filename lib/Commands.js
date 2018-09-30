'use strict'

const user = require('./commands/user')
const securityToken = require('./commands/securityToken')
const composed = require('./commands/composed')
const serviceCommand = require('./commands/service')
const abilityCommand = require('./commands/ability')

const Commands = (service, models, client) => {
  const commands = {
    user: user.Commands(service, models, client),
    securityToken: securityToken.Commands(service, models, client),
    service: serviceCommand.Commands(service, models, client),
    ability: abilityCommand.Commands(service, models, client)
  }

  return {
    ...commands,
    composed: composed.Commands(service, models, client, commands)
  }
}

module.exports = Commands
