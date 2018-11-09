'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./securityTokens.json')
const { roles, API_KEY } = require('../security/utils')

const Operations = (service, commands) => ({
  getSecurityTokens: {
    auth: (userData, params, body) => {
      if (userData.role === roles.ADMIN || userData._id === params.query.user) {
        return true
      } else if (userData.role === roles.SERVICE_REGISTERER && params.query.type === API_KEY) {
        return commands.user.get({
          _id: params.query.user
        }).then(user => {
          if (user.role === roles.MODULE) {
            return Promise.resolve()
          }
          return Promise.reject(new service.errors.Forbidden())
        })
      } else {
        return false
      }
    },
    handler: (params, body, res) => {
      const filter = omitBy({
        type: params.query.type,
        _user: params.query.user
      }, isUndefined)
      return commands.securityToken.getFiltered(filter)
    }
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
