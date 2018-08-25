
const md5 = require('md5')
const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')

const MODEL_NAME = 'User'

const Model = service => {
  const Schema = mongoose.Schema
  const models = {}

  const uniqueEmailValidator = utils.ValidateUniqueModel(models, MODEL_NAME, 'email', templates.emailAlreadyExists())

  const schema = new Schema({
    name: {
      type: String,
      required: [true, templates.userNameRequired()],
      validate: {
        validator: utils.ValidateUniqueModel(models, MODEL_NAME, 'name'),
        message: templates.userNameAlreadyExists()
      }
    },
    email: {
      type: String,
      required: [true, templates.userEmailRequired()],
      validate: value => Promise.all([
        new Promise((resolve, reject) => {
          if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
            resolve()
          } else {
            reject(new Error(templates.notValidEmail({
              value
            })))
          }
        }),
        uniqueEmailValidator(value)
      ])
    },
    password: {
      type: String,
      required: [true, templates.userPasswordRequired()],
      set: pass => md5(pass)
    },
    role: {
      type: String,
      required: [true, templates.userRoleRequired()],
      enum: [
        'admin',
        'service',
        'plugin'
      ]
    }
  },
  {
    timestamps: true
  })

  models.User = mongoose.model(MODEL_NAME, schema)

  return models.User
}

module.exports = {
  Model
}
