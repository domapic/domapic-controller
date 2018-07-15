'use strict'

const templates = require('../templates')
const utils = require('../utils')

const Commands = function (service, models, client) {
  const add = function (userData) {
    const user = new models.User(userData)
    return user.save(userData)
      .catch((error) => {
        return utils.transformValidationErrors(error, service)
      })
      .then(() => service.tracer.debug(templates.userAdded({
        name: user.name,
        id: user._id
      })))
      .then(() => Promise.resolve(user))
  }

  const getAll = function () {
    return models.User.find()
  }

  return {
    add,
    getAll
  }
}

module.exports = {
  Commands
}
