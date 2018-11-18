'use strict'

const events = require('events')

const emitter = new events.EventEmitter()

const PLUGIN = 'plugin'
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

module.exports = {
  PLUGIN,
  OPERATIONS,
  emitter,
  plugin
}
