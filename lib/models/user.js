
const mongoose = require('mongoose')

const templates = require('../templates')
const utils = require('../utils')

const Model = function (service) {
  const Schema = mongoose.Schema
  const models = {}

  const uniqueEmailValidator = utils.ValidateUniqueModel(models, 'User', 'email', templates.emailAlreadyExists())

  const schema = new Schema({
    name: {
      type: String,
      required: [true, templates.userNameRequired()],
      validate: {
        validator: utils.ValidateUniqueModel(models, 'User', 'name'),
        message: templates.userNameAlreadyExists()
      }
    },
    email: {
      type: String,
      validate: function (value) {
        return Promise.all([
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
      }
    },
    role: {
      type: String,
      enum: [
        'admin',
        'service',
        'plugin'
      ]
    }
  })

  models.User = mongoose.model('User', schema)

  return models.User
}

module.exports = {
  Model
}
