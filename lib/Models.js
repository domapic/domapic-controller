'use strict'

const user = require('./models/user')
const refreshToken = require('./models/refreshToken')

const Models = service => ({
  User: user.Model(service),
  RefreshToken: refreshToken.Model(service)
})

module.exports = Models
