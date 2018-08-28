
const test = require('narval')
const testUtils = require('narval/utils')

const utils = require('./utils')

const DB_URI = process.env.db_uri

test.describe('server', function () {
  test.it('should have printed a log with the mongodb uri', () => {
    return testUtils.logs.combined('controller')
      .then((log) => {
        return test.expect(log).to.contain(`Connecting with database "${DB_URI}"`)
      })
  })

  test.it('should have saved the db connection configuration', () => {
    return utils.readStorage('config')
      .then((config) => {
        return test.expect(config.db).to.equal(DB_URI)
      })
  })
})
