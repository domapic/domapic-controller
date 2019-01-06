'use strict'

const jwt = require('./security/jwt')
const apiKey = require('./security/apiKey')
const disabled = require('./security/disabled')

const Security = (service, commands) => {
  const jwtMethods = jwt.Methods(service, commands)
  const apiKeyMethods = apiKey.Methods(service, commands)
  const disabledMethods = disabled.Methods(service, commands)

  const methods = () => service.config.get('secret').then(secret => ({
    jwt: {
      secret: secret,
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
    },
    disabled: {
      verify: disabledMethods.verify
    }
  }))

  return {
    methods
  }
}

module.exports = Security
