'use strict'

const randToken = require('rand-token')

const templates = require('../templates')
const utils = require('../utils')

const Commands = (service, models, client) => {
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

  const getUser = token => models.SecurityToken.findOne({token})
    .then(tokenData => {
      if (tokenData) {
        return models.User.findById(tokenData._user)
      }
      return Promise.reject(new service.errors.NotFound(templates.securityTokenNotFound()))
    })

  const remove = token => getUser(token).then(userData => models.SecurityToken.deleteOne({token})
    .then(service.tracer.debug(templates.securityTokenRemoved({
      email: userData.email,
      token
    }))))

  return {
    add,
    remove,
    getUser
  }
}

module.exports = {
  Commands
}
