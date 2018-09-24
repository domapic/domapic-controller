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
        res.header('location', `/api/users/${user._id}`)
        return Promise.resolve()
      })
  },
  getUser: {
    auth: (userData, params, body) => (userData.role === roles.ADMIN || params.path._id === userData._id),
    handler: (params, body, res) => commands.user.getById(params.path._id)
  },
  getUserMe: {
    handler: (params, body, res, userData) => commands.user.getById(userData._id)
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
