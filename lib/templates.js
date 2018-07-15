'use strict'

const domapic = require('domapic-base')

const templates = {
  connectingDb: 'Connecting with database "{{db}}"',
  connectedDb: 'Connected to database "{{db}}"',

  userNameRequired: 'User name required',
  notValidEmail: '"{{value}}" is not a valid email',

  userAdded: 'New user with name "{{name}}" was added. Assigned id: "{{id}}"',
  userNameAlreadyExists: 'User name already exists',
  emailAlreadyExists: 'Email already exists'
}

module.exports = domapic.utils.templates.compile(templates)
