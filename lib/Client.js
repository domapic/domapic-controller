'use strict'

const uris = require('./uris')
const templates = require('./templates')

const Client = service => {
  const sendAction = (serviceData, ability, data) => {
    const client = new service.client.Connection(serviceData.url, {
      apiKey: serviceData.apiKey
    })

    return service.tracer.debug(templates.sendingAbilityAction({
      _service: serviceData._id,
      _ability: ability._id,
      data: data.data
    })).then(() => client.post(uris.abilityActionHandler(ability.name), data)
      .catch((err) => {
        if (err.typeof === 'ServerUnavailable') {
          return Promise.reject(new service.errors.BadGateway(templates.serviceNotAvailable()))
        }
        return Promise.reject(err)
      })
    )
  }

  return {
    sendAction
  }
}

module.exports = Client
