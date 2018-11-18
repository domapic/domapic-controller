'use strict'

const events = require('events')

const emitter = new events.EventEmitter()

const PLUGIN = 'plugin'

const plugin = (entity, operation, data) => {
  emitter.emit(PLUGIN, {
    entity,
    operation,
    data
  })
}

module.exports = {
  emitter,
  PLUGIN,
  plugin
}
