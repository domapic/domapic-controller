'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name processId description package _user version url updatedAt createdAt'

const Commands = (service, models, client) => {
  const ensureModule = moduleData => {
    if (!moduleData) {
      return Promise.reject(new service.errors.NotFound(templates.moduleNotFound()))
    }
    return Promise.resolve(moduleData)
  }

  const add = (userData, moduleData) => {
    const newModule = new models.Module({
      ...moduleData,
      name: userData.name,
      _user: userData._id
    })
    return newModule.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.moduleAdded(newModule)))
      .then(() => Promise.resolve(newModule))
  }

  const getFiltered = (filter = {}) => models.Module.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.Module.findOne(filter, PUBLIC_FIELDS).then(ensureModule)

  const getById = (id, options = {}) => models.Module.findById(id, options.allFields ? undefined : PUBLIC_FIELDS)
    .catch(() => Promise.resolve(null))
    .then(ensureModule)

  const update = (_id, data) => models.Module.findOneAndUpdate({
    _id
  }, data, { runValidators: true, context: 'query' }).catch(error => utils.transformValidationErrors(error, service)).then(ensureModule)

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
