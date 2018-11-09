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

  moduleNameRequired: 'Module name required',
  moduleProcessIdRequired: 'Module process identifier required',
  moduleNameAlreadyExists: 'Module name already exists',
  modulePackageRequired: 'Module package required',
  moduleVersionRequired: 'Module version required',
  moduleApiKeyRequired: 'Module apiKey required',
  moduleUrlRequired: 'Module url required',
  moduleUrlAlreadyExists: 'Module url already exists',
  moduleNotFound: 'Module not found',
  moduleAdded: 'New module with name "{{name}}" was added. Assigned id: "{{_id}}"',
  userHasNotRelatedModule: 'User has not a related module',

  abilityNameRequired: 'Ability name required',
  abilityTypeRequired: 'Ability data type is required',
  abilityNotFound: 'Ability not found',
  abilityAdded: 'New ability with name "{{name}}" of module "{{_module}}" was added. Assigned id: "{{_id}}"',
  abilityModuleRequired: 'Ability module is required',
  abilityUserRequired: 'Ability user is required',
  abilityRemoved: 'Ability with name "{{name}}" of module "{{_module}}" was removed',

  abilityActionNotDefined: 'Ability has not an action defined',
  abilityEventNotDefined: 'Ability has not an event defined',
  abilityStateNotDefined: 'Ability has not an state defined',
  sendingAbilityAction: 'Sending action to module "{{_module}}", ability "{{_ability}}". Data: {{{toJSON data}}}',
  receivedAbilityEvent: 'Received event from module "{{_module}}", ability "{{_ability}}". Data: {{{toJSON data}}}',
  gettingAbilityState: 'Sending request to get state from module "{{_module}}", ability "{{_ability}}"',
  moduleNotAvailable: 'Module not available',

  logAbilityRequired: 'Ability is required',
  logTypeRequired: 'Type is required'
}

module.exports = domapic.utils.templates.compile(templates)
