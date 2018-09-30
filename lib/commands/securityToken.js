'use strict'

const randToken = require('rand-token')

const templates = require('../templates')
const utils = require('../utils')

const PUBLIC_FIELDS = '_user token type updatedAt createdAt'

const Commands = (service, models, client) => {
  const ensureToken = token => {
    if (!token) {
      return Promise.reject(new service.errors.NotFound(templates.securityTokenNotFound()))
    }
    return Promise.resolve(token)
  }

  const add = (userData, type) => {
    const token = new models.SecurityToken({
      token: randToken.generate(64),
      _user: userData._id,
      type
    })
    return token.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.securityTokenAdded(userData)))
      .then(() => Promise.resolve(token))
  }

  const getFiltered = (filter = {}) => models.SecurityToken.find(filter, PUBLIC_FIELDS)

  const get = (filter = {}) => models.SecurityToken.findOne(filter, PUBLIC_FIELDS).then(ensureToken)

  const getUser = token => get({token})
    .then(tokenData => models.User.findById(tokenData._user))

  const remove = token => getUser(token).then(userData => models.SecurityToken.deleteOne({token})
    .then(service.tracer.debug(templates.securityTokenRemoved({
      name: userData.name,
      token
    }))))

  return {
    add,
    remove,
    get,
    getFiltered,
    getUser
  }
}

module.exports = {
  Commands
}
