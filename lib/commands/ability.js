'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name _service _user description event action state type format enum maxLength minLength pattern multipleOf minimum maximum exclusiveMaximum exclusiveMinimum updatedAt createdAt eventDescription actionDescription stateDescription'

const Commands = (service, models, client) => {
  const ensureAbility = abilityData => {
    if (!abilityData) {
      return Promise.reject(new service.errors.NotFound(templates.abilityNotFound()))
    }
    return Promise.resolve(abilityData)
  }

  const add = (userData, abilityData) => {
    return models.Service.findOne({
      _user: userData._id
    }).then(serviceData => {
      if (!serviceData) {
        return Promise.reject(new service.errors.Conflict(templates.userHasNotRelatedService()))
      }
      const ability = new models.Ability({
        ...abilityData,
        _user: userData._id,
        _service: serviceData._id
      })
      return ability.save()
        .catch(error => utils.transformValidationErrors(error, service))
        .then(() => service.tracer.debug(templates.abilityAdded(ability)))
        .then(() => Promise.resolve(ability))
    })
  }

  const getFiltered = (filter = {}) => models.Ability.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.Ability.findOne(filter, PUBLIC_FIELDS).then(ensureAbility)

  const getById = id => models.Ability.findById(id, PUBLIC_FIELDS)
    .catch(() => Promise.resolve(null))
    .then(ensureAbility)

  const update = (_id, data) => models.Ability.findOneAndUpdate({
    _id
  }, data, { runValidators: true }).catch(error => utils.transformValidationErrors(error, service)).then(ensureAbility)

  const remove = (_id) => models.Ability.findOneAndRemove({_id}).then(ensureAbility)
    .then(ability => service.tracer.debug(templates.abilityRemoved(ability)))

  return {
    add,
    getFiltered,
    get,
    getById,
    update,
    remove
  }
}

module.exports = {
  Commands
}
