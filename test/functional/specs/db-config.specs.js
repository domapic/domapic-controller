
const test = require('narval')

const utils = require('./utils')

const DB_URI = process.env.db_uri

test.describe('server', function () {
  test.it('should have printed a log with the mongodb uri', () => {
    return utils.readLogs()
      .then((log) => {
        return test.expect(log).to.contain(`Connected to database "${DB_URI}"`)
      })
  })

  test.it('should have saved the db connection configuration', () => {
    return utils.readStorage('config')
      .then((config) => {
        return test.expect(config.db).to.equal(DB_URI)
      })
  })
})
