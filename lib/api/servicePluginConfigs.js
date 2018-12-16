'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./servicePluginConfigs.json')
const { roles } = require('../security/utils')
const events = require('../events')

const EVENT_ENTITY = 'servicePluginConfig'

const Operations = (service, commands) => ({
  getServicePluginConfigs: {
    handler: (params, body, res) => {
      const filter = omitBy({
        service: params.query.service,
        pluginPackageName: params.query['plugin-package-name']
      }, isUndefined)
      return commands.servicePluginConfig.getFiltered(filter)
    }
  },
  getServicePluginConfig: {
    handler: (params, body, res) => commands.servicePluginConfig.getById(params.path.id)
  },
  updateServicePluginConfig: {
    auth: (userData, params, body) => {
      if (userData.role === roles.PLUGIN || userData.role === roles.ADMIN) {
        return Promise.resolve()
      }
      return commands.servicePluginConfig.getById(params.path.id).then(servicePluginConfigData => {
        return commands.service.getById(servicePluginConfigData._service).then(serviceData => {
          if (serviceData._user === userData._id) {
            return Promise.resolve()
          }
          return Promise.reject(new service.errors.Forbidden())
        })
      })
    },
    handler: (params, body, res) => commands.servicePluginConfig.update(params.path.id, body).then(servicePluginConfigData => {
      res.status(204)
      res.header('location', `/api/service-plugin-configs/${servicePluginConfigData._id}`)
      events.plugin(EVENT_ENTITY, events.OPERATIONS.UPDATE, servicePluginConfigData)
      return Promise.resolve()
    })
  },
  addServicePluginConfig: {
    auth: (userData, params, body) => {
      if (userData.role === roles.PLUGIN || userData.role === roles.ADMIN) {
        return Promise.resolve()
      }
      return commands.service.getById(body._service).then(serviceData => {
        if (serviceData._user === userData._id) {
          return Promise.resolve()
        }
        return Promise.reject(new service.errors.Forbidden())
      })
    },
    handler: (params, body, res, userData) => commands.servicePluginConfig.add(body)
      .then(servicePluginConfigData => {
        res.status(201)
        res.header('location', `/api/service-plugin-configs/${servicePluginConfigData._id}`)
        events.plugin(EVENT_ENTITY, events.OPERATIONS.CREATE, servicePluginConfigData)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
