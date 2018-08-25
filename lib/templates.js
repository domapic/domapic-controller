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

  authenticationError: 'Error creating jwt token: {{{message}}}',

  refreshTokenRequired: 'Refresh token is required',
  refreshTokenAlreadyExists: 'Refresh Token already exists',
  refreshTokenNotFound: 'Refresh token not found',
  refreshTokenAdded: 'New refresh token added for user with email "{{email}}"',
  refreshTokenRemoved: 'Refresh token {{token}} removed for user with email "{{email}}"'
}

module.exports = domapic.utils.templates.compile(templates)
