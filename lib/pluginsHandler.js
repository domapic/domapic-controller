'use strict'

const events = require('./events')

const init = (service, commands, client) => {
  events.emitter.on(events.PLUGIN, eventData => {
    const sendData = service => client.sendEvent(service, eventData)
    commands.service.getFiltered({
      type: 'plugin'
    }).then(services => {
      services.map(sendData)
    })
  })
}

module.exports = {
  init
}
