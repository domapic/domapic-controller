'use strict'

const Promise = require('bluebird')
const path = require('path')

const domapic = require('domapic-base')

const lib = require('./index')
const options = require('./options')

const serviceConfig = () => ({
  packagePath: path.resolve(__dirname, '..'),
  customConfig: options
})

const initService = (service) => {
  const database = lib.Database(service)
  const models = lib.Models(service)
  const client = lib.Client(service)
  const commands = lib.Commands(service, models, client)
  const security = lib.Security(service, commands)
  const api = lib.Api(service, commands)

  const extendOpenApis = () => Promise.map(api.openapis, openapi => service.server.extendOpenApi(openapi))

  return database.connect()
    .then(() => service.server.addAuthentication(security.methods))
    .then(() => extendOpenApis())
    .then(() => service.server.addOperations(api.operations))
    .then(service.server.start)
}

const start = () => domapic.Service(serviceConfig()).then(initService)

module.exports = {
  start
}
