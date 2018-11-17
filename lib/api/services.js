'use strict'

const definition = require('./services.json')
const { roles } = require('../security/utils')
const events = require('../events')

const EVENT_ENTITY = 'service'

const Operations = (service, commands) => ({
  getServices: {
    handler: (params, body, res) => commands.service.getFiltered()
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
      events.plugin(EVENT_ENTITY, 'update', serviceData)
      return Promise.resolve()
    })
  },
  addService: {
    auth: (userData, params, body) => (userData.role === roles.MODULE || userData.role === roles.PLUGIN) && body.type === userData.role,
    handler: (params, body, res, userData) => commands.service.add(userData, body)
      .then(serviceData => {
        res.status(201)
        res.header('location', `/api/services/${serviceData._id}`)
        events.plugin(EVENT_ENTITY, 'create', serviceData)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
