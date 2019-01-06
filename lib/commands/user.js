'use strict'

const templates = require('../templates')
const utils = require('../utils')
const { INITIAL_ADMIN_USER, SERVICE_REGISTERER_USER, ANONYMOUS_USER } = require('../security/utils')

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

  const getFiltered = (filter = {}) => models.User.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.User.findOne(filter, PUBLIC_FIELDS).then(ensureUser)

  const getById = id => models.User.findById(id, PUBLIC_FIELDS)
    .catch(() => Promise.resolve(null))
    .then(ensureUser)

  const remove = (filter = {}) => models.User.findOneAndRemove(filter).then(ensureUser)
    .then(user => service.tracer.debug(templates.userRemoved(user)))

  const init = () => getAll().then(users => users.length ? Promise.resolve() : Promise.all([
    add(INITIAL_ADMIN_USER),
    add(SERVICE_REGISTERER_USER),
    add(ANONYMOUS_USER)
  ]))

  return {
    add,
    getAll,
    getFiltered,
    get,
    getById,
    remove,
    init
  }
}

module.exports = {
  Commands
}
