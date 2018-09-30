
const test = require('narval')

const mocks = require('../mocks')

const Database = require('../../../lib/Database')

test.describe('Database', () => {
  const fooUri = 'foo-db-connection'
  let baseMocks
  let mongooseMocks
  let database

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    baseMocks.stubs.service.config.get.resolves(fooUri)
    mongooseMocks = new mocks.Mongoose()
    database = Database(baseMocks.stubs.service)
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
        return database.connect()
          .then(() => test.expect(baseMocks.stubs.service.tracer.info.getCall(0).args[0]).to.include(fooUri))
      })

      test.it('should call to mongoose connect', () => {
        return database.connect()
          .then(() => test.expect(mongooseMocks.stubs.connect.getCall(0).args[0]).to.equal(fooUri))
      })
    })

    test.describe('disconnect method', () => {
      test.it('should call to mongoose disconnect', () => {
        return database.disconnect()
          .then(() => test.expect(mongooseMocks.stubs.disconnect).to.have.been.called())
      })
    })
  })
})
