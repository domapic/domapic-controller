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
  notValidUrl: '"{{value}}" is not a valid url',

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

  serviceRegistererApiKey: `\n${separator}\nUse the next api key to register services: {{token}}\n${separator}`,

  serviceNameRequired: 'Service name required',
  serviceProcessIdRequired: 'Service process identifier required',
  serviceNameAlreadyExists: 'Service name already exists',
  servicePackageRequired: 'Service package required',
  serviceVersionRequired: 'Service version required',
  serviceApiKeyRequired: 'Service apiKey required',
  serviceUrlRequired: 'Service url required',
  serviceUrlAlreadyExists: 'Service url already exists',
  serviceNotFound: 'Service not found',
  serviceAdded: 'New service with name "{{name}}" was added. Assigned id: "{{_id}}"',
  userHasNotRelatedService: 'User has not a related service',

  abilityNameRequired: 'Ability name required',
  abilityTypeRequired: 'Ability data type is required',
  abilityNotFound: 'Ability not found',
  abilityAdded: 'New ability with name "{{name}}" of service "{{_service}}" was added. Assigned id: "{{_id}}"',
  abilityServiceRequired: 'Ability service is required',
  abilityUserRequired: 'Ability user is required',
  abilityRemoved: 'Ability with name "{{name}}" of service "{{_service}}" was removed',

  abilityActionNotDefined: 'Ability has not an action defined',
  sendingAbilityAction: 'Sending action to service "{{_service}}", ability "{{_ability}}". Data: {{{toJSON data}}}',
  serviceNotAvailable: 'Service not available'
}

module.exports = domapic.utils.templates.compile(templates)