'use strict'

const jwt = require('./security/jwt')
const apiKey = require('./security/apiKey')

const Security = (service, commands) => {
  const jwtMethods = jwt.Methods(service, commands)
  const apiKeyMethods = apiKey.Methods(service, commands)

  return {
    methods: {
      jwt: {
        secret: 'thisIsNotaRealTokenSecretPleaseReplaceIt',
        expiresIn: 180,
        authenticate: {
          handler: jwtMethods.authenticateHandler
        },
        revoke: {
          auth: jwtMethods.revokeAuth,
          handler: jwtMethods.revokeHandler
        }
      },
      apiKey: {
        verify: apiKeyMethods.verify,
        authenticate: {
          auth: apiKeyMethods.authenticateAuth,
          handler: apiKeyMethods.authenticateHandler
        },
        revoke: {
          auth: apiKeyMethods.revokeAuth,
          handler: apiKeyMethods.revokeHandler
        }
      }
    }
  }
}

module.exports = Security
