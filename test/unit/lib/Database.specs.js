
const test = require('narval')

const mocks = require('../mocks')

const Database = require('../../../lib/Database')

test.describe('Database', () => {
  let baseMocks
  let mongooseMocks
  let database

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    mongooseMocks = new mocks.Mongoose()
    database = new Database(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    mongooseMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('connect method', () => {
      test.it('should call to get database config', () => {
        return database.connect()
          .then(() => test.expect(baseMocks.stubs.service.config.get).to.have.been.calledWith('db'))
      })

      test.it('should trace the database config', () => {
        const fooUri = 'foo-db-connection'
        baseMocks.stubs.service.config.get.resolves(fooUri)
        return database.connect()
          .then(() => test.expect(baseMocks.stubs.service.tracer.info.getCall(0).args[0]).to.include(fooUri))
      })
    })
  })
})
