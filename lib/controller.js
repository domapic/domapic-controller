'use strict'

const Promise = require('bluebird')
const path = require('path')

const domapic = require('domapic-base')

const lib = require('./index')
const options = require('./options')

const start = function () {
  return domapic.Service({
    packagePath: path.resolve(__dirname, '..'),
    customConfig: options
  }).then((service) => {
    const database = new lib.Database(service)
    const models = new lib.Models(service)
    const client = new lib.Client(service)
    const commands = new lib.Commands(service, models, client)
    const security = new lib.Security(service, commands)
    const api = new lib.Api(service, commands)

    const extendOpenApis = function () {
      return Promise.map(api.openapis, (openapi) => {
        return service.server.extendOpenApi(openapi)
      })
    }

    return database.connect()
      .then(() => service.server.addAuthentication(security.methods))
      .then(() => extendOpenApis())
      .then(() => service.server.addOperations(api.operations))
      .then(service.server.start)
  })
}

module.exports = {
  start
}
