'use strict'

const definition = require('./logs.json')

const Operations = (service, commands) => ({
  getLogs: {
    handler: () => commands.log.getAll()
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
