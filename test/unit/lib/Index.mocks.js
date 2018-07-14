
const test = require('narval')

const Api = require('./Api.mocks')
const Database = require('./Database.mocks')
const Models = require('./Models.mocks')
const Client = require('./Client.mocks')
const Commands = require('./Commands.mocks')
const Security = require('./Security.mocks')

const index = require('../../../lib/index')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const api = new Api()
  const database = new Database()
  const models = new Models()
  const client = new Client()
  const commands = new Commands()
  const security = new Security()

  const stubs = {
    api: api.stubs,
    Api: sandbox.stub(index, 'Api').returns(api.stubs),
    database: database.stubs,
    Database: sandbox.stub(index, 'Database').returns(database.stubs),
    models: models.stubs,
    Models: sandbox.stub(index, 'Models').returns(models.stubs),
    client: client.stubs,
    Client: sandbox.stub(index, 'Client').returns(client.stubs),
    commands: commands.stubs,
    Commands: sandbox.stub(index, 'Commands').returns(commands.stubs),
    security: security.stubs,
    Security: sandbox.stub(index, 'Security').returns(security.stubs)
  }

  const restore = function () {
    database.restore()
    models.restore()
    client.restore()
    commands.restore()
    security.restore()
    api.restore()
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
