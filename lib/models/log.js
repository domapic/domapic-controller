const mongoose = require('mongoose')

const templates = require('../templates')

const MODEL_NAME = 'Log'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const schema = new Schema({
    _ability: {
      type: String,
      required: [true, templates.logAbilityRequired()]
    },
    type: {
      type: String,
      required: [true, templates.logTypeRequired()],
      enum: ['action', 'event']
    },
    data: {
      type: mongoose.Mixed
    }
  },
  {
    capped: {
      size: 104857600,
      max: 10000,
      autoIndexId: true
    },
    timestamps: true
  })

  models.Log = mongoose.model(MODEL_NAME, schema)

  return models.Log
}

module.exports = {
  Model
}
