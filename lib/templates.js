'use strict'

const domapic = require('domapic-base')

const templates = {
  connectingDb: 'Connecting with database "{{db}}"',
  connectedDb: 'Connected to database "{{db}}"',

  userNameRequired: 'User name required',
  userEmailRequired: 'Email required',
  userPasswordRequired: 'Password required',
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
  securityTokenAdded: 'New security token added for user with email "{{email}}"',
  securityTokenRemoved: 'Security token {{token}} removed for user with email "{{email}}"'
}

module.exports = domapic.utils.templates.compile(templates)
