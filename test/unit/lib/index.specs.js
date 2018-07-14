
const test = require('narval')

const Api = require('../../../lib/Api')
const Database = require('../../../lib/Database')
const Models = require('../../../lib/Models')
const Client = require('../../../lib/Client')
const Commands = require('../../../lib/Commands')
const Security = require('../../../lib/Security')

const index = require('../../../lib/index')

test.describe('index', () => {
  test.it('should export Api', () => {
    return test.expect(index.Api).to.equal(Api)
  })

  test.it('should export Database', () => {
    return test.expect(index.Database).to.equal(Database)
  })

  test.it('should export Models', () => {
    return test.expect(index.Models).to.equal(Models)
  })

  test.it('should export Client', () => {
    return test.expect(index.Client).to.equal(Client)
  })

  test.it('should export Commands', () => {
    return test.expect(index.Commands).to.equal(Commands)
  })

  test.it('should export Security', () => {
    return test.expect(index.Security).to.equal(Security)
  })
})
