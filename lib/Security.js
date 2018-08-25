'use strict'

const templates = require('./templates')

const Security = (service, commands) => {
  const cleanUserData = userData => ({
    _id: userData._id,
    name: userData.name,
    email: userData.email,
    role: userData.role
  })

  const getUserByRefreshToken = refreshToken => commands.refreshToken.getUser(refreshToken)
    .then(userData => Promise.resolve({
      userData: cleanUserData(userData)
    }))

  const getUserByCredentials = userCredentials => {
    return commands.user.get({
      email: userCredentials.user,
      password: userCredentials.password
    }).then(userData => commands.refreshToken.add(userData)
      .then(refreshToken => Promise.resolve({
        userData: cleanUserData(userData),
        refreshToken: refreshToken.token
      })))
  }

  const authenticateHandler = body => {
    const action = body.refreshToken ? getUserByRefreshToken(body.refreshToken) : getUserByCredentials(body)
    return action.catch(error => service.tracer.error(templates.authenticationError({
      message: error.message
    })).then(() => Promise.reject(error)))
  }

  const revokeAuth = (userData, params, body) => {
    if (userData.role === 'admin') {
      return true
    }
    return getUserByRefreshToken(body.refreshToken)
      .then(tokenUserData => tokenUserData.userData.email === userData.email ? Promise.resolve() : Promise.reject(new Error()))
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
