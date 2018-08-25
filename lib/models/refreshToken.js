
const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'RefreshToken'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const schema = new Schema({
    token: {
      type: String,
      required: [true, templates.refreshTokenRequired()],
      validate: {
        validator: utils.ValidateUniqueModel(models, MODEL_NAME, 'token'),
        message: templates.refreshTokenAlreadyExists()
      }
    },
    _user: {
      type: String
    }
  },
  {
    timestamps: true
  })

  models.RefreshToken = mongoose.model(MODEL_NAME, schema)

  return models.RefreshToken
}

module.exports = {
  Model
}
