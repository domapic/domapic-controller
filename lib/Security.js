'use strict'

const Security = (service, commands) => {
  const getUserByRefreshToken = refreshToken => commands.refreshToken.getUser(refreshToken)
    .then(userData => Promise.resolve({
      userData
    }))

  const getUserByCredentials = userCredentials => {
    return commands.user.get({
      email: userCredentials.userName,
      password: userCredentials.password
    }).then(userData => commands.refreshToken.add(userData)
      .then(refreshToken => Promise.resolve({
        userData: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        },
        refreshToken: refreshToken.token
      })))
  }

  const authenticateHandler = body => {
    const action = body.refreshToken ? getUserByRefreshToken(body.refreshToken) : getUserByCredentials(body)
    return action.catch(() => /* TODO, trace error */ Promise.reject(new service.errors.Unauthorized()))
  }

  const revokeAuth = userData => {
    console.log(userData)
    // Check if user is allowed to remove an existant refresh token
    // return checkUserPermissionToManageApiKeys(userData)
    return true
  }

  const revokeHandler = body => commands.refreshToken.remove(body.refreshToken)

  return {
    methods: {
      jwt: {
        secret: 'thisIsNotaRealTokenSecretPleaseReplaceIt',
        expiresIn: 180,
        authenticate: {
          handler: authenticateHandler
        },
        revoke: {
          auth: revokeAuth,
          handler: revokeHandler
        }
      }
    }
  }
}

module.exports = Security
