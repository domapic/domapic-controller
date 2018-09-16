'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./services.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => ({
  getServices: {
    auth: (userData, params, body) => {
      if (userData.role === roles.ADMIN || userData.role === roles.SERVICE_REGISTERER || userData._id.toString() === params.query.user) {
        return true
      }
      return false
    },
    handler: (params, body, res) => {
      const filter = omitBy({
        _user: params.query.user
      }, isUndefined)
      return commands.service.getFiltered(filter)
    }
  },
  getService: {
    auth: (userData, params, body) => {
      if (userData.role === roles.ADMIN || userData.role === roles.SERVICE_REGISTERER) {
        return true
      }
      return commands.service.get({
        name: params.path.name
      }).then(serviceData => {
        if (serviceData._user === userData._id) {
          return Promise.resolve()
        }
        return Promise.reject(new service.errors.Forbidden())
      })
    },
    handler: (params, body, res) => commands.service.get({
      name: params.path.name
    })
  },
  addService: {
    auth: (userData, params, body) => (
      userData.role === roles.ADMIN || userData.role === roles.SERVICE_REGISTERER || userData._id.toString() === body._user
    ),
    handler: (params, body, res) => commands.service.add(body)
      .then(serviceData => {
        res.status(201)
        res.header('location', `/api/services/${serviceData.name}`)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
