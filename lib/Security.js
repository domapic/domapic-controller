'use strict'

const Security = function (service, commands) {
  return {
    methods: {
      jwt: {
        secret: 'thisIsNotaRealTokenSecretPleaseReplaceIt',
        expiresIn: 180,
        authenticate: {
          handler: (userCredentials) => {
            // Check if user has right credentials, or refresh token. Returns user data (with new refresh token if not provided)
            if (userCredentials.refreshToken) {
              return getUserDataFromRefreshToken(userCredentials.refreshToken)
            } else {
              return checkUserData({
                name: userCredentials.userName,
                password: userCredentials.password
              }).then((userData) => {
                return createNewRefreshToken(userData)
                  .then((refreshToken) => {
                    return Promise.resolve({
                      userData: userData,
                      refreshToken: refreshToken
                    })
                  })
              })
            }
          }
        },
        revoke: {
          auth: (userData) => {
            // Check if user is allowed to remove an existant refresh token
            return checkUserPermissionToManageApiKeys(userData)
          },
          handler: (refreshToken) => {
            // Remove existant refresh token
            return removeRefreshToken(refreshToken)
          }
        }
      }
    }
  }
}

module.exports = Security
