'use strict'

const Promise = require('bluebird')
const path = require('path')

const domapic = require('domapic-base')
const mongoSanitize = require('express-mongo-sanitize')
const ui = require('domapic-controller-ui')

const lib = require('./index')
const options = require('./options')
const pluginsHandler = require('./pluginsHandler')

const serviceConfig = () => ({
  packagePath: path.resolve(__dirname, '..'),
  customConfig: options,
  type: 'controller'
})

const initService = (service) => {
  const database = lib.Database(service)
  const models = lib.Models(service)
  const client = lib.Client(service)
  const commands = lib.Commands(service, models, client)
  const security = lib.Security(service, commands)
  const api = lib.Api(service, commands)
  pluginsHandler.init(service, commands, client)

  const extendOpenApis = () => Promise.map(api.openapis, openapi => service.server.extendOpenApi(openapi))

  return database.connect()
    .then(() => service.server.addMiddleware(mongoSanitize()))
    .then(() => service.server.addStatic("/", ui.getAbsoluteDistPath()))
    .then(() => service.server.addStatic("/*", path.resolve(ui.getAbsoluteDistPath(), "index.html")))
    .then(() => security.methods().then(methods => service.server.addAuthentication(methods)))
    .then(() => extendOpenApis())
    .then(() => service.server.addOperations(api.operations))
    .then(commands.composed.initUsers)
    .then(service.server.start)
}

const start = () => domapic.Service(serviceConfig()).then(initService)

module.exports = {
  start
}
