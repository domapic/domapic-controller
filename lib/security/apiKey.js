'use strict'

const utils = require('./utils')

const Methods = (service, commands) => {
  const getUserByApiKey = utils.GetUserBySecurityToken(commands)

  const authenticateAuth = utils.AuthOperation((userData, params, body) => Promise.resolve({
    name: body.user
  }))

  const authenticateHandler = (params, body) => commands.user.get({
    name: body.user
  }).then(user => commands.securityToken.add(user, 'apikey')
    .then(securityToken => Promise.resolve(securityToken.token))
  )

  const revokeAuth = utils.AuthOperation((userData, params, body) => getUserByApiKey(body.apiKey))

  const revokeHandler = (params, body, res, userData) => commands.securityToken.remove(body.apiKey)

  return {
    verify: getUserByApiKey,
    authenticateAuth,
    authenticateHandler,
    revokeAuth,
    revokeHandler
  }
}

module.exports = {
  Methods
}
