'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./users.json')
const { roles, onlyAdmin } = require('../security/utils')
const events = require('../events')

const LOCATION = 'location'
const LOCATION_ROOT = '/api/users/'
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
          res.header(LOCATION, `${LOCATION_ROOT}${user._id}`)
          events.all(EVENT_ENTITY, events.OPERATIONS.CREATE, user, [roles.ADMIN, roles.ANONYMOUS])
          return Promise.resolve()
        })
    },
    getUser: {
      auth: (userData, params) => commands.user.getById(params.path.id)
        .then(user => {
          if (rolesBasedAuth(userData.role, user.role) || params.path.id === userData._id) {
            return Promise.resolve()
          }
          return Promise.reject(new service.errors.Forbidden())
        }),
      handler: (params, body, res) => commands.user.getById(params.path.id)
    },
    updateUser: {
      auth: (userData, params, body) => {
        return commands.user.getById(params.path.id)
          .then(user => {
            if (
              // Only operators and admin users can be modified
              [roles.ADMIN, roles.OPERATOR].includes(user.role) &&
              // Role can be only modified by administrators
              (userData.role === roles.ADMIN || (params.path.id === userData._id && !body.role)) &&
              // Role can be modified only to operator or admin roles
              (!body.role || [roles.ADMIN, roles.OPERATOR].includes(body.role))
            ) {
              return Promise.resolve()
            }
            return Promise.reject(new service.errors.Forbidden())
          })
      },
      handler: (params, body, res) => commands.user.update(params.path.id, body).then(user => {
        res.status(204)
        res.header(LOCATION, `${LOCATION_ROOT}${user._id}`)
        events.all(EVENT_ENTITY, events.OPERATIONS.UPDATE, user, [roles.ADMIN, roles.ANONYMOUS])
        return Promise.resolve()
      })
    },
    deleteUser: {
      auth: onlyAdmin,
      handler: (params, body, res) => commands.composed.removeUser(params.path.id).then(() => {
        res.status(204)
        events.all(EVENT_ENTITY, events.OPERATIONS.DELETE, {
          _id: params.path.id
        }, [roles.ADMIN, roles.ANONYMOUS])
        return Promise.resolve()
      })
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
