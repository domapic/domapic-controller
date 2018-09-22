'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./abilities.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => {
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
      handler: (params, body, res) => commands.ability.get({
        _id: params.path.id
      })
    },
    updateAbility: {
      // TODO, allow only user owner of the service to add
      handler: (params, body, res) => commands.ability.update(params.path.id, body).then(abilityData => {
        res.status(204)
        res.header('location', `/api/abilities/${abilityData._id}`)
        return Promise.resolve()
      })
    },
    addAbility: {
      // TODO, allow only user owner of the service to update
      handler: (params, body, res) => commands.ability.add(body)
        .then(abilityData => {
          res.status(201)
          res.header('location', `/api/abilities/${abilityData._id}`)
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
