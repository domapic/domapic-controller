'use strict'

const uris = require('./uris')
const templates = require('./templates')

const Client = service => {
  const handleServiceError = (error) => {
    if (error.typeof === 'ServerUnavailable') {
      return Promise.reject(new service.errors.BadGateway(templates.moduleNotAvailable()))
    }
    return Promise.reject(error)
  }

  const sendAction = (moduleData, ability, data) => {
    const client = new service.client.Connection(moduleData.url, {
      apiKey: moduleData.apiKey
    })

    return service.tracer.debug(templates.sendingAbilityAction({
      _module: moduleData._id,
      _ability: ability._id,
      data: data.data
    })).then(() => client.post(uris.abilityActionHandler(ability.name), data)
      .catch(handleServiceError)
    )
  }

  const getState = (moduleData, ability) => {
    const client = new service.client.Connection(moduleData.url, {
      apiKey: moduleData.apiKey
    })

    return service.tracer.debug(templates.gettingAbilityState({
      _module: moduleData._id,
      _ability: ability._id
    })).then(() => client.get(uris.abilityStateHandler(ability.name))
      .then(response => Promise.resolve(response.body))
      .catch(handleServiceError)
    )
  }

  return {
    sendAction,
    getState
  }
}

module.exports = Client
