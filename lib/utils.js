'use strict'

const _ = require('lodash')

const ValidateUniqueModel = function (models, ref, field, errorMessage) {
  return function (value) {
    const finder = {}
    finder[field] = value
    return models[ref].findOne(finder)
      .then((existingDocument) => {
        if (existingDocument) {
          return Promise.reject(new Error(errorMessage))
        }
        return Promise.resolve()
      })
  }
}

const transformValidationErrors = function (error, service) {
  if (error.name === 'ValidationError') {
    const errorMessages = []
    _.each(error.errors, (errorDetails, errorName) => {
      if (errorDetails.reason && errorDetails.reason.message) {
        errorMessages.push(`${errorName}: ${errorDetails.reason.message}`)
      } else {
        errorMessages.push(`${errorName}: ${errorDetails.message}`)
      }
    })
    return Promise.reject(new service.errors.BadData(errorMessages.join(', ')))
  }
  return Promise.reject(error)
}

module.exports = {
  ValidateUniqueModel,
  transformValidationErrors
}
