const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'ServicePluginConfig'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const schema = new Schema({
    _service: {
      type: String,
      required: [true, templates.serviceIdRequired()]
    },
    pluginPackageName: {
      type: String,
      required: [true, templates.pluginPackageNameRequired()]
    },
    uniqueId: {
      type: String,
      required: [true, templates.servicePackageRequired()],
      validate: utils.ValidateUniqueModel(models, MODEL_NAME, 'uniqueId', templates.servicePluginConfigAlreadyExists())
    },
    config: {
      type: mongoose.Mixed
    }
  },
  {
    timestamps: true
  })

  models.ServicePluginConfig = mongoose.model(MODEL_NAME, schema)

  return models.ServicePluginConfig
}

module.exports = {
  Model
}
