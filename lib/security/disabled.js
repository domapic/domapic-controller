'use strict'

const utils = require('./utils')

const Methods = (service, commands) => {
  let anonymousUserPromise = null

  const getAnonymousUser = userCredentials => {
    if (anonymousUserPromise) {
      return anonymousUserPromise
    }
    anonymousUserPromise = commands.user.get({
      name: utils.ANONYMOUS_USER.name
    }).then(userData => Promise.resolve(utils.cleanUserData(userData)))
    return anonymousUserPromise
  }

  return {
    verify: getAnonymousUser
  }
}

module.exports = {
  Methods
}
