
const test = require('narval')
const testUtils = require('narval/utils')

const utils = require('./utils')

test.describe('server', function () {
  test.it('should have printed a log when started', () => {
    return testUtils.logs.combined('controller')
      .then((log) => {
        return test.expect(log).to.contain('Server started and listening at port 3000')
      })
  })

  test.it('should response with the package info to requests to "/about" api resource', () => {
    return utils.request('/about')
      .then((response) => {
        return Promise.all([
          test.expect(response.body.name).to.equal('controller'),
          test.expect(response.body.type).to.equal('controller'),
          test.expect(response.body.package).to.equal('domapic-controller'),
          test.expect(response.body.author).to.equal('Javier Brea')
        ])
      })
  })
})
