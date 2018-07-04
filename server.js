'use strict'

const domapic = require('domapic-base')

new domapic.Service().then((service) => {
  return service.server.start()
})
