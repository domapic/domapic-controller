'use strict'

const uris = require('./uris')
const templates = require('./templates')

const Client = service => {
  const handleServiceError = (error) => {
    if (error.typeof === 'ServerUnavailable') {
      return Promise.reject(new service.errors.BadGateway(templates.serviceNotAvailable()))
    }
    return Promise.reject(error)
  }

  const sendAction = (serviceData, ability, data) => {
    const client = new service.client.Connection(serviceData.url, {
      apiKey: serviceData.apiKey
    })

    return service.tracer.debug(templates.sendingAbilityAction({
      _service: serviceData._id,
      _ability: ability._id,
      data: data.data || ''
    })).then(() => client.post(uris.abilityActionHandler(ability.name), data)
      .catch(handleServiceError)
    )
  }

  const getState = (serviceData, ability) => {
    const client = new service.client.Connection(serviceData.url, {
      apiKey: serviceData.apiKey
    })

    return service.tracer.debug(templates.gettingAbilityState({
      _service: serviceData._id,
      _ability: ability._id
    })).then(() => client.get(uris.abilityStateHandler(ability.name))
      .then(response => Promise.resolve(response.body))
      .catch(handleServiceError)
    )
  }

  const sendEvent = (serviceData, eventData) => {
    const client = new service.client.Connection(serviceData.url, {
      apiKey: serviceData.apiKey
    })

    return service.tracer.debug(templates.sendingEvent({
      _service: serviceData._id,
      _id: eventData.data._id,
      ...eventData
    })).then(() => client.post(uris.serviceEventHandler(), eventData)
      .catch(err => {
        return service.tracer.warn(templates.errorSendingEvent({
          _service: serviceData._id,
          ...eventData
        }), err.message)
      })
    )
  }

  return {
    sendAction,
    getState,
    sendEvent
  }
}

module.exports = Client
