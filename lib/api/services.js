'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./services.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => {
  const authService = (userData, params, body) => {
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
  }

  return {
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
      auth: authService,
      handler: (params, body, res) => commands.service.get({
        name: params.path.name
      })
    },
    updateService: {
      auth: authService,
      handler: (params, body, res) => commands.service.update(params.path.name, body).then(serviceData => {
        res.status(204)
        res.header('location', `/api/services/${serviceData.name}`)
        return Promise.resolve()
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
  }
}

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
