'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name processId description package _user version url updatedAt createdAt'

const Commands = (service, models, client) => {
  const ensureService = serviceData => {
    if (!serviceData) {
      return Promise.reject(new service.errors.NotFound(templates.serviceNotFound()))
    }
    return Promise.resolve(serviceData)
  }

  const add = (userData, serviceData) => {
    const newService = new models.Service({
      ...serviceData,
      name: userData.name,
      _user: userData._id
    })
    return newService.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.serviceAdded(newService)))
      .then(() => Promise.resolve(newService))
  }

  const getFiltered = (filter = {}) => models.Service.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.Service.findOne(filter, PUBLIC_FIELDS).then(ensureService)

  const getById = (id, options = {}) => models.Service.findById(id, options.allFields ? undefined : PUBLIC_FIELDS)
    .catch(() => Promise.resolve(null))
    .then(ensureService)

  const update = (_id, data) => models.Service.findOneAndUpdate({
    _id
  }, data, { runValidators: true, context: 'query' }).catch(error => utils.transformValidationErrors(error, service)).then(ensureService)

  return {
    add,
    getFiltered,
    get,
    getById,
    update
  }
}

module.exports = {
  Commands
}
