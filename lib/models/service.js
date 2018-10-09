const mongoose = require('mongoose')
const isUri = require('isuri')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'Service'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const uniqueNameValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'name', templates.serviceNameAlreadyExists())
  const nameValidator = utils.FieldValidator(utils.isValidName, templates.notValidName)

  const uniqueUrlValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'url', templates.serviceUrlAlreadyExists())
  const urlValidator = utils.FieldValidator(url => isUri.isValid(url), templates.notValidUrl)

  const schema = new Schema({
    name: {
      type: String,
      required: [true, templates.serviceNameRequired()],
      validate: value => Promise.all([
        nameValidator(value),
        uniqueNameValidator(value)
      ])
    },
    processId: {
      type: String,
      required: [true, templates.serviceProcessIdRequired()]
    },
    description: {
      type: String
    },
    package: {
      type: String,
      required: [true, templates.servicePackageRequired()]
    },
    version: {
      type: String,
      required: [true, templates.serviceVersionRequired()]
    },
    apiKey: {
      type: String,
      required: [true, templates.serviceApiKeyRequired()]
    },
    url: {
      type: String,
      required: [true, templates.serviceUrlRequired()],
      validate: function (value) {
        return Promise.all([
          urlValidator(value),
          uniqueUrlValidator.bind(this)(value)
        ])
      }
    },
    _user: {
      type: String
    }
  },
  {
    timestamps: true
  })

  models.Service = mongoose.model(MODEL_NAME, schema)

  return models.Service
}

module.exports = {
  Model
}
