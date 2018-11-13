'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./users.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => ({
  getUsers: {
    auth: (userData, params, body) => (
      userData.role === roles.ADMIN ||
      (userData.role === roles.SERVICE_REGISTERER && (params.query.role === roles.MODULE || params.query.role === roles.PLUGIN))
    ),
    handler: (params, body, res) => {
      const filter = omitBy({
        name: params.query.name,
        role: params.query.role
      }, isUndefined)
      return commands.user.getFiltered(filter)
    }
  },
  addUser: {
    auth: (userData, params, body) => (
      userData.role === roles.ADMIN ||
      (userData.role === roles.SERVICE_REGISTERER && (body.role === roles.MODULE || body.role === roles.PLUGIN))
    ),
    handler: (params, body, res) => commands.user.add(body)
      .then(user => {
        res.status(201)
        res.header('location', `/api/users/${user._id}`)
        return Promise.resolve()
      })
  },
  getUser: {
    auth: (userData, params, body) => (userData.role === roles.ADMIN || params.path.id === userData._id),
    handler: (params, body, res) => commands.user.getById(params.path.id)
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
