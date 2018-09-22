'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./abilities.json')
const { roles } = require('../security/utils')

const Operations = (service, commands) => ({
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
    auth: (userData, params, body) => {
      return commands.ability.get({
        _id: params.path.id
      }).then(abilityData => {
        if (abilityData._user === userData._id) {
          return Promise.resolve()
        }
        return Promise.reject(new service.errors.Forbidden())
      })
    },
    handler: (params, body, res) => commands.ability.update(params.path.id, body).then(abilityData => {
      res.status(204)
      res.header('location', `/api/abilities/${abilityData._id}`)
      return Promise.resolve()
    })
  },
  addAbility: {
    auth: (userData) => userData.role === roles.SERVICE,
    handler: (params, body, res, userData) => commands.ability.add({
        ...body,
        _user: userData._id
      })
      .then(abilityData => {
        res.status(201)
        res.header('location', `/api/abilities/${abilityData._id}`)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
