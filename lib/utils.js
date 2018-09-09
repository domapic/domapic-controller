'use strict'

const _ = require('lodash')

const ValidateUniqueModel = (models, ref, field, errorMessage) => value => {
  const finder = {}
  finder[field] = value
  return models[ref].findOne(finder)
    .then(existingDocument => {
      if (existingDocument) {
        return Promise.reject(new Error(errorMessage))
      }
      return Promise.resolve()
    })
}

const FieldValidator = (validator, errorTemplate) => value => new Promise((resolve, reject) => {
  if (validator(value)) {
    resolve()
  } else {
    reject(new Error(errorTemplate({
      value
    })))
  }
})

const transformValidationErrors = (error, service) => {
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
  FieldValidator,
  transformValidationErrors
}
