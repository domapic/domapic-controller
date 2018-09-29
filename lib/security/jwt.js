'use strict'

const utils = require('./utils')

const Methods = (service, commands) => {
  const getUserByRefreshToken = utils.GetUserBySecurityToken(commands)

  const getUserByCredentials = userCredentials => {
    return commands.user.get({
      name: userCredentials.user,
      password: userCredentials.password
    }).then(userData => commands.securityToken.add(userData, utils.JWT)
      .then(securityToken => Promise.resolve({
        userData: utils.cleanUserData(userData),
        refreshToken: securityToken.token
      })))
  }

  const authenticateHandler = (params, body) => body.refreshToken ? getUserByRefreshToken(body.refreshToken)
    .then(userData => ({userData})) : getUserByCredentials(body)

  const revokeAuth = utils.AdminOrOwner((userData, params, body) => getUserByRefreshToken(params.path.refreshToken))

  const revokeHandler = (params, body) => commands.securityToken.remove(params.path.refreshToken)

  return {
    authenticateHandler,
    revokeAuth,
    revokeHandler
  }
}

module.exports = {
  Methods
}
