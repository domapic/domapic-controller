'use strict'

const domapic = require('domapic-base')

const separator = '-----------------------------------------------------------------'

const templates = {
  connectingDb: 'Connecting with database "{{db}}"',
  connectedDb: 'Connected to database "{{db}}"',
  disconnectDb: 'Disconnecting from database',

  userNameRequired: 'User name required',
  notValidName: 'Name must contain only lowercase letters, numbers or dashes',
  userRoleRequired: 'Role required',
  notValidEmail: '"{{value}}" is not a valid email',

  userAdded: 'New user with name "{{name}}" was added. Assigned id: "{{_id}}"',
  userRemoved: 'User with name "{{name}}" was removed',
  userNameAlreadyExists: 'User name already exists',
  userNotFound: 'User not found',
  emailAlreadyExists: 'Email already exists',
  userEmailRequired: 'Email is required',
  userPasswordRequired: 'Password is required',
  notValidUserAction: 'Action must be one of {{actions}}',

  securityTokenTypeRequired: 'Security token type is required',
  securityTokenRequired: 'Security token is required',
  securityTokenAlreadyExists: 'Security token already exists',

  securityTokenNotFound: 'Security token not found',
  securityTokenAdded: 'New security token added for user with name "{{name}}"',
  securityTokenRemoved: 'Security token {{token}} removed for user with name "{{name}}"',

  serviceRegistererApiKey: `\n${separator}\nUse the next api key to register services: {{token}}\n${separator}`
}

module.exports = domapic.utils.templates.compile(templates)
