'use strict'

const definition = require('./modules.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => ({
  getModules: {
    handler: (params, body, res) => commands.module.getFiltered()
  },
  getModule: {
    handler: (params, body, res) => commands.module.getById(params.path.id)
  },
  updateModule: {
    auth: (userData, params, body) => commands.module.getById(params.path.id).then(moduleData => {
      if (moduleData._user === userData._id) {
        return Promise.resolve()
      }
      return Promise.reject(new service.errors.Forbidden())
    }),
    handler: (params, body, res) => commands.module.update(params.path.id, body).then(moduleData => {
      res.status(204)
      res.header('location', `/api/modules/${moduleData._id}`)
      return Promise.resolve()
    })
  },
  addModule: {
    auth: (userData, params, body) => userData.role === roles.MODULE,
    handler: (params, body, res, userData) => commands.module.add(userData, body)
      .then(moduleData => {
        res.status(201)
        res.header('location', `/api/modules/${moduleData._id}`)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
