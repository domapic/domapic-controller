'use strict'

const user = require('./models/user')
const securityToken = require('./models/securityToken')
const serviceModel = require('./models/service')
const servicePluginConfig = require('./models/servicePluginConfig')
const ability = require('./models/ability')
const log = require('./models/log')

const Models = service => ({
  User: user.Model(service),
  SecurityToken: securityToken.Model(service),
  Service: serviceModel.Model(service),
  ServicePluginConfig: servicePluginConfig.Model(service),
  Ability: ability.Model(service),
  Log: log.Model(service)
})

module.exports = Models
