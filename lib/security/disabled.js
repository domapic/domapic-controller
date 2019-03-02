'use strict'

const utils = require('./utils')

const Methods = (service, commands) => {
  return {
    verify: utils.GetAnonymousUser(commands)
  }
}

module.exports = {
  Methods
}
