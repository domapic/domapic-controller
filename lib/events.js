'use strict'

const events = require('events')

const emitter = new events.EventEmitter()

const PLUGIN = 'plugin'
const SOCKET = 'socket'

const OPERATIONS = {
  CREATE: 'created',
  DELETE: 'deleted',
  UPDATE: 'updated',
  ACTION: 'action',
  EVENT: 'event'
}

const plugin = (entity, operation, data) => {
  emitter.emit(PLUGIN, {
    entity,
    operation,
    data
  })
}

const socket = (entity, operation, data, roles) => {
  emitter.emit(SOCKET, {
    entity,
    operation,
    data,
    roles
  })
}

const all = (entity, operation, data, roles) => {
  plugin(entity, operation, data)
  socket(entity, operation, data, roles)
}

module.exports = {
  PLUGIN,
  SOCKET,
  OPERATIONS,
  emitter,
  plugin,
  socket,
  all
}
