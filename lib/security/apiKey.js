'use strict'

const utils = require('./utils')

const Methods = (service, commands) => {
  const getUserByApiKey = utils.GetUserBySecurityToken(commands)

  const authenticateAuth = (userData, params, body) => {
    if (userData.role === utils.roles.ADMIN || userData._id === body.user) {
      return Promise.resolve()
    }
    if (userData.role === utils.roles.SERVICE_REGISTERER) {
      return commands.user.getById(body.user)
        .then(userData => {
          if (userData.role === utils.roles.MODULE || userData.role === utils.roles.PLUGIN) {
            return Promise.resolve()
          }
          return Promise.reject(new service.errors.Forbidden())
        })
    }
    return Promise.reject(new service.errors.Forbidden())
  }

  const authenticateHandler = (params, body, res, userData) => commands.user.getById(body.user)
    .then(user => commands.securityToken.add(user, utils.API_KEY, userData)
      .then(securityToken => Promise.resolve(securityToken.token))
    )

  const revokeAuth = utils.AdminOrOwner((userData, params, body) => getUserByApiKey(params.path.apiKey))

  const revokeHandler = (params, body, res, userData) => commands.securityToken.remove(params.path.apiKey)

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
