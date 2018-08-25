'use strict'

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = 'name email role updatedAt createdAt'

const Commands = (service, models, client) => {
  const ensureUser = user => {
    if (!user) {
      return Promise.reject(new service.errors.NotFound(templates.userNotFound()))
    }
    return Promise.resolve(user)
  }

  const add = userData => {
    const user = new models.User(userData)
    return user.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.userAdded(user)))
      .then(() => Promise.resolve(user))
  }

  const getAll = () => models.User.find({}, PUBLIC_FIELDS)

  const getById = _id => models.User.findById(_id).then(ensureUser)

  const get = (filter = {}) => models.User.findOne(filter, PUBLIC_FIELDS).then(ensureUser)

  return {
    add,
    getAll,
    getById,
    get
  }
}

module.exports = {
  Commands
}
