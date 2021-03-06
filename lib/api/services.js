'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./services.json')
const { roles, onlyAdmin } = require('../security/utils')
const events = require('../events')

const EVENT_ENTITY = 'service'

const Operations = (service, commands) => ({
  getServices: {
    handler: (params, body, res) => {
      const filter = omitBy({
        type: params.query.type
      }, isUndefined)
      return commands.service.getFiltered(filter)
    }
  },
  getService: {
    handler: (params, body, res) => commands.service.getById(params.path.id)
  },
  updateService: {
    auth: (userData, params, body) => commands.service.getById(params.path.id).then(serviceData => {
      if (serviceData._user === userData._id) {
        return Promise.resolve()
      }
      return Promise.reject(new service.errors.Forbidden())
    }),
    handler: (params, body, res) => commands.service.update(params.path.id, body).then(serviceData => {
      res.status(204)
      res.header('location', `/api/services/${serviceData._id}`)
      events.all(EVENT_ENTITY, events.OPERATIONS.UPDATE, serviceData)
      return Promise.resolve()
    })
  },
  addService: {
    auth: (userData, params, body) => (userData.role === roles.MODULE || userData.role === roles.PLUGIN) && body.type === userData.role,
    handler: (params, body, res, userData) => commands.composed.getServiceOwner(userData, body)
      .then(serviceOwner => commands.service.add(serviceOwner, body)
        .then(serviceData => {
          res.status(201)
          res.header('location', `/api/services/${serviceData._id}`)
          events.all(EVENT_ENTITY, events.OPERATIONS.CREATE, serviceData)
          return Promise.resolve()
        }))
  },
  deleteService: {
    auth: onlyAdmin,
    handler: (params, body, res) => commands.composed.removeService(params.path.id).then(() => {
      res.status(204)
      events.all(EVENT_ENTITY, events.OPERATIONS.DELETE, {
        _id: params.path.id
      })
      return Promise.resolve()
    })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
