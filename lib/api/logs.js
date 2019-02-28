'use strict'

const { omitBy, isUndefined } = require('lodash')

const definition = require('./logs.json')

const abilityFilter = params => omitBy({_ability: params.query.ability}, isUndefined)

const parse = {
  params: {
    page: page => Number(page)
  }
}

const Operations = (service, commands) => ({
  getLogs: {
    handler: params => {
      const filter = abilityFilter(params)
      if (params.query.page) {
        return commands.log.getPaginated(params.query.page, filter)
      }
      return commands.log.getAll(filter)
    },
    parse
  },
  getLogsStats: {
    handler: params => {
      return commands.log.getStats(abilityFilter(params))
    },
    parse
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
