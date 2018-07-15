'use strict'

const user = require('./models/User')

const Models = function (service) {
  return {
    User: user.Model(service)
  }
}

module.exports = Models
