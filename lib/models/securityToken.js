
const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')
const securityUtils = require('../security/utils')

const MODEL_NAME = 'SecurityToken'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const schema = new Schema({
    token: {
      type: String,
      required: [true, templates.securityTokenRequired()],
      validate: {
        validator: utils.ValidateUniqueModel(models, MODEL_NAME, 'token'),
        message: templates.securityTokenAlreadyExists()
      }
    },
    _user: {
      type: String
    },
    type: {
      type: String,
      required: [true, templates.securityTokenTypeRequired()],
      enum: [
        securityUtils.API_KEY,
        securityUtils.JWT
      ]
    }
  },
  {
    timestamps: true
  })

  models.SecurityToken = mongoose.model(MODEL_NAME, schema)

  return models.SecurityToken
}

module.exports = {
  Model
}
