'use strict'

const domapic = require('domapic-base')

const templates = {
  connectingDb: 'Connecting with database "{{db}}"',
  connectedDb: 'Connected to database "{{db}}"',

  userNameRequired: 'User name required',
  userRoleRequired: 'Role required',
  notValidEmail: '"{{value}}" is not a valid email',

  userAdded: 'New user with name "{{name}}" was added. Assigned id: "{{_id}}"',
  userNameAlreadyExists: 'User name already exists',
  userNotFound: 'User not found',
  emailAlreadyExists: 'Email already exists',

  securityTokenTypeRequired: 'Security token type is required',
  securityTokenRequired: 'Security token is required',
  securityTokenAlreadyExists: 'Security token already exists',

  securityTokenNotFound: 'Security token not found',
  securityTokenAdded: 'New security token added for user with name "{{name}}"',
  securityTokenRemoved: 'Security token {{token}} removed for user with name "{{name}}"'
}

module.exports = domapic.utils.templates.compile(templates)
