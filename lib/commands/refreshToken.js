'use strict'

const randToken = require('rand-token')

const templates = require('../templates')
const utils = require('../utils')

const Commands = (service, models, client) => {
  const add = userData => {
    const token = new models.RefreshToken({
      token: randToken.generate(32),
      _user: userData._id
    })
    return token.save()
      .catch(error => utils.transformValidationErrors(error, service))
      .then(() => service.tracer.debug(templates.refreshTokenAdded(userData)))
      .then(() => Promise.resolve(token))
  }

  const getUser = token => models.RefreshToken.findOne({token})
    .then(tokenData => {
      if (tokenData) {
        return models.User.findById(tokenData._user)
      }
      return Promise.reject(new service.errors.NotFound(templates.refreshTokenNotFound()))
    })

  const remove = token => getUser(token).then((userData) => models.RefreshToken.deleteOne({token})
    .then(service.tracer.debug(templates.refreshTokenRemoved({
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
