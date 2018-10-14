'use strict'

const uris = require('./uris')

const Client = service => {
  const sendAction = (serviceData, ability, data) => {
    const client = new service.client.Connection(serviceData.url, {
      apiKey: serviceData.apiKey
    })

    return client.post(uris.abilityActionHandler(ability.name), data)
  }

  return {
    sendAction
  }
}

module.exports = Client
