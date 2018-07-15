'use strict'

const user = require('./models/user')

const Models = function (service) {
  return {
    User: user.Model(service)
  }
}

module.exports = Models
