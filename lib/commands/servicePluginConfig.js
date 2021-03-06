'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = '_service pluginPackageName config updatedAt createdAt'

const Commands = (service, models, client) => {
  const ensureServicePluginConfig = servicePluginConfigData => {
    if (!servicePluginConfigData) {
      return Promise.reject(new service.errors.NotFound(templates.servicePluginConfigNotFound()))
    }
    return Promise.resolve(servicePluginConfigData)
  }

  const add = data => {
    return models.Service.findById(data._service)
      .catch(() => {
        return Promise.reject(new service.errors.BadData(templates.serviceNotFound()))
      })
      .then(serviceData => {
        const newServicePluginConfig = new models.ServicePluginConfig({
          ...data,
          uniqueId: `${data._service}_${data.pluginPackageName}`
        })
        return newServicePluginConfig.save()
          .catch(error => utils.transformValidationErrors(error, service))
          .then(() => service.tracer.debug(templates.servicePluginConfigAdded(newServicePluginConfig)))
          .then(() => Promise.resolve(newServicePluginConfig))
      })
  }

  const getFiltered = (filter = {}, options = {}) => models.ServicePluginConfig.find(filter, options.allFields ? undefined : PUBLIC_FIELDS)

  const get = (filter = {}) => models.ServicePluginConfig.findOne(filter, PUBLIC_FIELDS).then(ensureServicePluginConfig)

  const getById = (id, options = {}) => models.ServicePluginConfig.findById(id, options.allFields ? undefined : PUBLIC_FIELDS)
    .catch(() => Promise.resolve(null))
    .then(ensureServicePluginConfig)

  const update = (_id, data) => models.ServicePluginConfig.findOneAndUpdate({
    _id
  }, data, { runValidators: true, context: 'query', new: true }).catch(error => utils.transformValidationErrors(error, service)).then(ensureServicePluginConfig)

  const remove = _id => models.ServicePluginConfig.findOneAndRemove({ _id }).then(ensureServicePluginConfig)
    .then(servicePluginConfig => service.tracer.debug(templates.servicePluginConfigRemoved(servicePluginConfig)))

  const findAndRemove = filter => models.ServicePluginConfig.deleteMany(filter)

  return {
    add,
    getFiltered,
    get,
    getById,
    update,
    remove,
    findAndRemove
  }
}

module.exports = {
  Commands
}
