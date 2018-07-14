'use strict'

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

    return database.connect()
      .then(() => service.server.addAuthentication(security.methods))
      .then(() => service.server.extendOpenApi(api.openapi))
      .then(() => service.server.addOperations(api.operations))
      .then(service.server.start)
  })
}

module.exports = {
  start
}
