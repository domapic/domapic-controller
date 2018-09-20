'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name _service description event action state type format enum maxLength minLength pattern multipleOf minimum maximum exclusiveMaximum exclusiveMinimum'

const Commands = (service, models, client) => {
  const ensureAbility = abilityData => {
    if (!abilityData) {
      return Promise.reject(new service.errors.NotFound(templates.abilityNotFound()))
    }
    return Promise.resolve(abilityData)
  }

  const add = abilityData => {
    const ability = new models.Ability(abilityData)
    return ability.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.abilityAdded(ability)))
      .then(() => Promise.resolve(ability))
  }

  const getFiltered = (filter = {}) => models.Ability.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.Ability.findOne(filter, PUBLIC_FIELDS).then(ensureAbility)

  const update = (_id, data) => models.Ability.findOneAndUpdate({
    _id
  }, data, { runValidators: true }).catch(error => utils.transformValidationErrors(error, service)).then(ensureAbility)

  return {
    add,
    getFiltered,
    get,
    update
  }
}

module.exports = {
  Commands
}
