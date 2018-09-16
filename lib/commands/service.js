'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name description package version url _user updatedAt createdAt'

const Commands = (service, models, client) => {
  const add = serviceData => {
    const newService = new models.Service(serviceData)
    return newService.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.serviceAdded(newService)))
      .then(() => Promise.resolve(newService))
  }

  const getFiltered = (filter = {}) => models.Service.find(filter, PUBLIC_FIELDS)

  return {
    add,
    getFiltered
  }
}

module.exports = {
  Commands
}
