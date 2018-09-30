const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'Ability'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const schema = new Schema({
    _service: {
      type: String,
      required: [true, templates.abilityServiceRequired()]
    },
    _user: {
      type: String,
      required: [true, templates.abilityUserRequired()]
    },
    name: {
      type: String,
      required: [true, templates.abilityNameRequired()],
      validate: utils.FieldValidator(utils.isValidAbilityName, templates.notValidName)
    },
    description: {
      type: String
    },
    event: {
      type: Boolean,
      default: false
    },
    eventDescription: {
      type: String
    },
    action: {
      type: Boolean,
      default: false
    },
    actionDescription: {
      type: String
    },
    state: {
      type: Boolean,
      default: false
    },
    stateDescription: {
      type: String
    },
    type: {
      type: String,
      required: [true, templates.abilityTypeRequired()],
      enum: ['string', 'number', 'float', 'integer', 'boolean']
    },
    format: {
      type: String,
      enum: ['date-time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri']
    },
    enum: {
      type: [String],
      default: undefined
    },
    maxLength: {
      type: Number
    },
    minLength: {
      type: Number
    },
    pattern: {
      type: String
    },
    multipleOf: {
      type: Number
    },
    minimum: {
      type: Number
    },
    maximum: {
      type: Number
    },
    exclusiveMaximum: {
      type: Boolean
    },
    exclusiveMinimum: {
      type: Boolean
    }
  },
  {
    timestamps: true
  })

  models.Ability = mongoose.model(MODEL_NAME, schema)

  return models.Ability
}

module.exports = {
  Model
}
