'use strict'

const definition = require('./users.json')
const { onlyAdmin, roles } = require('../security/utils')

const Operations = (service, commands) => ({
  getUsers: {
    auth: onlyAdmin,
    handler: () => commands.user.getAll()
  },
  addUser: {
    auth: (userData, params, body) => (
      userData.role === roles.ADMIN ||
      (userData.role === roles.SERVICE_REGISTERER && body.role === roles.SERVICE)
    ),
    handler: (params, body, res) => commands.user.add(body)
      .then(user => {
        res.status(201)
        res.header('location', `/api/users/${user.name}`)
        return Promise.resolve()
      })
  },
  getUser: {
    auth: (userData, params, body) => {
      // TODO, allow only to get services users if role = service_registerer
      if (userData.role === roles.ADMIN || userData.role === roles.SERVICE_REGISTERER) {
        return true
      }
      return commands.user.get({
        name: params.path.name
      }).then(user => {
        if (user._id.toString() === userData._id) {
          return Promise.resolve()
        }
        return Promise.reject(new service.errors.Forbidden())
      })
    },
    handler: (params, body, res) => commands.user.get({
      name: params.path.name
    })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
