'use strict'

const user = require('./models/user')
const securityToken = require('./models/securityToken')

const Models = service => ({
  User: user.Model(service),
  SecurityToken: securityToken.Model(service)
})

module.exports = Models
