
const Mongoose = require('./Mongoose.mocks')
const Base = require('./Base.mocks')
const Client = require('./lib/Client.mocks')
const Security = require('./lib/Security.mocks')
const Utils = require('./lib/Utils.mocks')

const Controller = require('./lib/Controller.mocks')
const Database = require('./lib/Database.mocks')
const Index = require('./lib/Index.mocks')

const Api = require('./lib/Api.mocks')
const UsersApi = require('./lib/api/Users.mocks')
const SecurityTokensApi = require('./lib/api/SecurityTokens.mocks')
const ModulesApi = require('./lib/api/Modules.mocks')
const AbilitiesApi = require('./lib/api/Abilities.mocks')
const LogsApi = require('./lib/api/Logs.mocks')

const Commands = require('./lib/Commands.mocks')
const UserCommands = require('./lib/commands/User.mocks')
const SecurityTokenCommands = require('./lib/commands/SecurityToken.mocks')
const ComposedCommands = require('./lib/commands/Composed.mocks')
const ModuleCommands = require('./lib/commands/Module.mocks')
const AbilityCommands = require('./lib/commands/Ability.mocks')
const LogCommands = require('./lib/commands/Log.mocks')

const Models = require('./lib/Models.mocks')
const UserModel = require('./lib/models/User.mocks')
const ModuleModel = require('./lib/models/Module.mocks')
const SecurityTokenModel = require('./lib/models/SecurityToken.mocks')
const AbilityModel = require('./lib/models/Ability.mocks')
const LogModel = require('./lib/models/Log.mocks')

module.exports = {
  Api,
  api: {
    Users: UsersApi,
    SecurityTokens: SecurityTokensApi,
    Modules: ModulesApi,
    Abilities: AbilitiesApi,
    Logs: LogsApi
  },
  commands: {
    User: UserCommands,
    SecurityToken: SecurityTokenCommands,
    Composed: ComposedCommands,
    Module: ModuleCommands,
    Ability: AbilityCommands,
    Log: LogCommands
  },
  models: {
    User: UserModel,
    SecurityToken: SecurityTokenModel,
    Module: ModuleModel,
    Ability: AbilityModel,
    Log: LogModel
  },
  Base,
  Client,
  Commands,
  Controller,
  Database,
  Index,
  Models,
  Mongoose,
  Security,
  Utils
}
