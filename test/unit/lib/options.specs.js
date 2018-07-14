const test = require('narval')

const options = require('../../../lib/options')

test.describe('options', () => {
  test.it('should define the db option', () => {
    return test.expect(options.db).to.not.be.undefined()
  })
})
