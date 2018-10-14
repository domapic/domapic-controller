'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./abilities.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => {
  const onlyOwner = (userData, params, body) => {
    return commands.ability.getById(params.path.id).then(abilityData => {
      if (abilityData._user === userData._id) {
        return Promise.resolve()
      }
      return Promise.reject(new service.errors.Forbidden())
    })
  }

  return {
    getAbilities: {
      handler: (params, body, res) => {
        const filter = omitBy({
          _service: params.query.service
        }, isUndefined)
        return commands.ability.getFiltered(filter)
      }
    },
    getAbility: {
      handler: (params, body, res) => commands.ability.getById(params.path.id)
    },
    updateAbility: {
      auth: onlyOwner,
      handler: (params, body, res) => commands.ability.update(params.path.id, body).then(abilityData => {
        res.status(204)
        res.header('location', `/api/abilities/${abilityData._id}`)
        return Promise.resolve()
      })
    },
    addAbility: {
      auth: (userData) => userData.role === roles.SERVICE,
      handler: (params, body, res, userData) => commands.ability.add(userData, body).then(abilityData => {
        res.status(201)
        res.header('location', `/api/abilities/${abilityData._id}`)
        return Promise.resolve()
      })
    },
    deleteAbility: {
      auth: onlyOwner,
      handler: (params, body, res, userData) => commands.ability.remove(params.path.id).then(() => {
        res.status(204)
        return Promise.resolve()
      })
    },
    abilityAction: {
      handler: (params, body, res) => commands.composed.dispatchAbilityAction(params.path.id, body).then(serviceResponse => {
        res.status(201)
        res.header('location', `/api/abilities/${params.path.id}/state`)
        return Promise.resolve()
      })
    }
  }
}

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}