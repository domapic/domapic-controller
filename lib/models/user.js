
const _ = require('lodash')
const md5 = require('md5')
const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')
const { roles } = require('../security/utils')

const MODEL_NAME = 'User'

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

const isValidEmail = email => emailRegex.test(email)

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const requireEmailAndPassword = function () {
    return ![roles.SERVICE, roles.SERVICE_REGISTERER, roles.PLUGIN].includes(this.role)
  }

  const uniqueEmailValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'email', templates.emailAlreadyExists())
  const emailValidator = utils.FieldValidator(isValidEmail, templates.notValidEmail)

  const uniqueNameValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'name', templates.userNameAlreadyExists())
  const nameValidator = utils.FieldValidator(utils.isValidName, templates.notValidName)

  const schema = new Schema({
    name: {
      type: String,
      required: [true, templates.userNameRequired()],
      validate: value => Promise.all([
        nameValidator(value),
        uniqueNameValidator(value)
      ])
    },
    email: {
      type: String,
      required: [requireEmailAndPassword, templates.userEmailRequired()],
      validate: value => Promise.all([
        emailValidator(value),
        uniqueEmailValidator(value)
      ])
    },
    password: {
      type: String,
      required: [requireEmailAndPassword, templates.userPasswordRequired()],
      set: pass => md5(pass)
    },
    role: {
      type: String,
      required: [true, templates.userRoleRequired()],
      enum: _.map(roles, role => role)
    }
  },
  {
    timestamps: true
  })

  models.User = mongoose.model(MODEL_NAME, schema)

  return models.User
}

module.exports = {
  isValidEmail,
  Model
}