
const test = require('narval')

const utils = require('./utils')

test.describe('server', function () {
  this.timeout(10000)

  test.before(() => {
    return utils.waitOnestimatedStartTime()
  })

  test.it('should have printed a log when started', () => {
    return utils.readOutErr()
      .then((log) => {
        return test.expect(log).to.contain('Server started and listening at port 3000')
      })
  })

  // TODO, add a request to server to check that it is working
})
