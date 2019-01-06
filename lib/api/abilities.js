'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./abilities.json')
const { roles } = require('../security/utils')
const events = require('../events')

const LOCATION = 'location'
const LOCATION_ROOT = '/api/abilities/'
const EVENT_ENTITY = 'ability'

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
        res.header(LOCATION, `${LOCATION_ROOT}${abilityData._id}`)
        events.plugin(EVENT_ENTITY, events.OPERATIONS.UPDATE, abilityData)
        return Promise.resolve()
      })
    },
    addAbility: {
      auth: (userData) => userData.role === roles.MODULE,
      handler: (params, body, res, userData) => commands.composed.getAbilityOwner(userData, body)
        .then(abilityOwner => commands.ability.add(abilityOwner, body).then(abilityData => {
          res.status(201)
          res.header(LOCATION, `${LOCATION_ROOT}${abilityData._id}`)
          events.plugin(EVENT_ENTITY, events.OPERATIONS.CREATE, abilityData)
          return Promise.resolve()
        }))
    },
    deleteAbility: {
      auth: onlyOwner,
      handler: (params, body, res, userData) => commands.ability.remove(params.path.id).then(() => {
        res.status(204)
        events.plugin(EVENT_ENTITY, events.OPERATIONS.DELETE, {
          _id: params.path.id
        })
        return Promise.resolve()
      })
    },
    abilityAction: {
      handler: (params, body, res) => commands.composed.dispatchAbilityAction(params.path.id, body).then(serviceResponse => {
        res.status(201)
        res.header(LOCATION, `${LOCATION_ROOT}${params.path.id}/state`)
        events.plugin(EVENT_ENTITY, events.OPERATIONS.ACTION, {
          _id: params.path.id,
          ...body
        })
        return Promise.resolve()
      })
    },
    abilityState: {
      handler: (params, body, res) => commands.composed.getAbilityState(params.path.id)
    },
    abilityEvent: {
      auth: onlyOwner,
      handler: (params, body, res) => commands.composed.triggerAbilityEvent(params.path.id, body).then(() => {
        res.status(201)
        res.header(LOCATION, `${LOCATION_ROOT}${params.path.id}/state`)
        events.plugin(EVENT_ENTITY, events.OPERATIONS.EVENT, {
          _id: params.path.id,
          ...body
        })
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
