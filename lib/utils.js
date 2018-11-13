'use strict'

const _ = require('lodash')

const NAME_REGEX = /^[a-z0-9_.-]*$/
const ABILITY_NAME_REGEX = /^[a-zA-Z0-9_-]*$/
const SERVICES_TYPES = ['module', 'plugin']

const ValidateUniqueModel = (models, ref, field, errorMessage) => function (value) {
  const finder = {}
  const conditions = []
  finder[field] = value

  if (this && this.model && this._conditions && !this.isNew) {
    conditions.push({[field]: new RegExp('^' + value + '$', 'i')})

    _.each(this._conditions, (value, key) => {
      conditions.push({ [key]: { $ne: value } })
    })

    return new Promise((resolve, reject) => {
      this.model.where({
        $and: conditions
      }).countDocuments((err, count) => {
        if (err) {
          reject(err)
        } else if (count === 0) {
          resolve()
        } else {
          reject(new Error(errorMessage))
        }
      })
    })
  }

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

const isValidName = name => NAME_REGEX.test(name)
const isValidAbilityName = name => ABILITY_NAME_REGEX.test(name)

module.exports = {
  ValidateUniqueModel,
  FieldValidator,
  transformValidationErrors,
  isValidAbilityName,
  isValidName,
  SERVICES_TYPES
}
