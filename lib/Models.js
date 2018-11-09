'use strict'

const user = require('./models/user')
const securityToken = require('./models/securityToken')
const moduleModel = require('./models/module')
const ability = require('./models/ability')
const log = require('./models/log')

const Models = service => ({
  User: user.Model(service),
  SecurityToken: securityToken.Model(service),
  Module: moduleModel.Model(service),
  Ability: ability.Model(service),
  Log: log.Model(service)
})

module.exports = Models
