'use strict'

const user = require('./models/user')
const securityToken = require('./models/securityToken')
const serviceModel = require('./models/service')
const ability = require('./models/ability')

const Models = service => ({
  User: user.Model(service),
  SecurityToken: securityToken.Model(service),
  Service: serviceModel.Model(service),
  Ability: ability.Model(service)
})

module.exports = Models