
const test = require('narval')

const utils = require('./utils')

test.describe('logs api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()

  test.before(() => {
    return utils.waitOnestimatedStartTime(3000)
      .then(() => utils.doLogin(authenticator))
  })

  test.describe('logs api', () => {
    test.it('should return all logs', () => {
      return utils.request(`/logs`, {
        method: 'GET',
        ...authenticator.credentials()
      }).then(logsResponse => {
        const log = logsResponse.body[0]
        return Promise.all([
          test.expect(log.type).to.equal('event'),
          test.expect(log._ability).to.not.be.undefined(),
          test.expect(log.data).to.equal('foo1@foo1.com')
        ])
      })
    })
  })
})
