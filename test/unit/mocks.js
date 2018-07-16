
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
const UserCommands = require('./lib/commands/User.mocks')
const UserModel = require('./lib/models/User.mocks')
const Utils = require('./lib/Utils.mocks')

module.exports = {
  Api,
  api: {
    Users: UsersApi
  },
  commands: {
    User: UserCommands
  },
  models: {
    User: UserModel
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
