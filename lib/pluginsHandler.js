'use strict'

const _ = require('lodash')
const events = require('./events')

const init = (service, commands, client) => {
  events.emitter.on(events.PLUGIN, eventData => {
    const sendData = service => client.sendEvent(service, eventData)
    commands.service.getFiltered({
      type: 'plugin'
    }).then(services => {
      _.each(services, sendData)
    })
  })
}

module.exports = {
  init
}
