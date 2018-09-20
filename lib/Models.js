'use strict'

const user = require('./models/user')
const securityToken = require('./models/securityToken')
const serviceModel = require('./models/service')

const Models = service => ({
  User: user.Model(service),
  SecurityToken: securityToken.Model(service),
  Service: serviceModel.Model(service)
})

module.exports = Models
