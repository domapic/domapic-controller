
const Api = require('./lib/Api.mocks')
const Mongoose = require('./Mongoose.mocks')
const Base = require('./Base.mocks')
const Client = require('./lib/Client.mocks')
const Commands = require('./lib/Commands.mocks')
const Controller = require('./lib/Controller.mocks')
const Database = require('./lib/Database.mocks')
const Index = require('./lib/Index.mocks')
const Models = require('./lib/Models.mocks')
const Security = require('./lib/Security.mocks')
const UsersApi = require('./lib/api/Users.mocks')
const SecurityTokensApi = require('./lib/api/SecurityTokens.mocks')
const UserCommands = require('./lib/commands/User.mocks')
const SecurityTokenCommands = require('./lib/commands/SecurityToken.mocks')
const ComposedCommands = require('./lib/commands/Composed.mocks')
const UserModel = require('./lib/models/User.mocks')
const ServiceModel = require('./lib/models/Service.mocks')
const SecurityTokenModel = require('./lib/models/SecurityToken.mocks')
const Utils = require('./lib/Utils.mocks')

module.exports = {
  Api,
  api: {
    Users: UsersApi,
    SecurityTokens: SecurityTokensApi
  },
  commands: {
    User: UserCommands,
    SecurityToken: SecurityTokenCommands,
    Composed: ComposedCommands
  },
  models: {
    User: UserModel,
    SecurityToken: SecurityTokenModel,
    Service: ServiceModel
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
