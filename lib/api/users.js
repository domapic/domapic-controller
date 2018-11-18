'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./users.json')
const { roles } = require('../security/utils')
const events = require('../events')

const EVENT_ENTITY = 'user'

const Operations = (service, commands) => {
  const rolesBasedAuth = (loggedRole, userRole) => (
    loggedRole === roles.ADMIN ||
    (loggedRole === roles.SERVICE_REGISTERER && (userRole === roles.MODULE || userRole === roles.PLUGIN)) ||
    (loggedRole === roles.PLUGIN && (userRole === roles.OPERATOR))
  )

  return {
    getUsers: {
      auth: (userData, params, body) => rolesBasedAuth(userData.role, params.query && params.query.role),
      handler: (params, body, res) => {
        const filter = omitBy({
          name: params.query.name,
          role: params.query.role
        }, isUndefined)
        return commands.user.getFiltered(filter)
      }
    },
    addUser: {
      auth: (userData, params, body) => rolesBasedAuth(userData.role, body.role),
      handler: (params, body, res) => commands.user.add(body)
        .then(user => {
          res.status(201)
          res.header('location', `/api/users/${user._id}`)
          events.plugin(EVENT_ENTITY, 'create', user)
          return Promise.resolve()
        })
    },
    getUser: {
      auth: (userData, params, body) => {
        return commands.user.getById(params.path.id)
          .then(user => {
            if (rolesBasedAuth(userData.role, user.role) || params.path.id === userData._id) {
              return Promise.resolve()
            }
            return Promise.reject(new service.errors.Forbidden())
          })
      },
      handler: (params, body, res) => commands.user.getById(params.path.id)
    },
    getUserMe: {
      handler: (params, body, res, userData) => commands.user.getById(userData._id)
    }
  }
}

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
