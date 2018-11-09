const mongoose = require('mongoose')
const isUri = require('isuri')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'Module'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const uniqueNameValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'name', templates.moduleNameAlreadyExists())
  const nameValidator = utils.FieldValidator(utils.isValidName, templates.notValidName)

  const uniqueUrlValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'url', templates.moduleUrlAlreadyExists())
  const urlValidator = utils.FieldValidator(url => isUri.isValid(url), templates.notValidUrl)

  const schema = new Schema({
    name: {
      type: String,
      required: [true, templates.moduleNameRequired()],
      validate: value => Promise.all([
        nameValidator(value),
        uniqueNameValidator(value)
      ])
    },
    processId: {
      type: String,
      required: [true, templates.moduleProcessIdRequired()]
    },
    description: {
      type: String
    },
    package: {
      type: String,
      required: [true, templates.modulePackageRequired()]
    },
    version: {
      type: String,
      required: [true, templates.moduleVersionRequired()]
    },
    apiKey: {
      type: String,
      required: [true, templates.moduleApiKeyRequired()]
    },
    url: {
      type: String,
      required: [true, templates.moduleUrlRequired()],
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

  models.Module = mongoose.model(MODEL_NAME, schema)

  return models.Module
}

module.exports = {
  Model
}
