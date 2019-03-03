
const test = require('narval')

const utils = require('./utils')

test.describe('logs api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let abilityId

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
        const log = logsResponse.body[2]
        abilityId = log._ability
        return Promise.all([
          test.expect(log.type).to.equal('event'),
          test.expect(log._ability).to.not.be.undefined(),
          test.expect(log.data).to.equal('foo1@foo1.com')
        ])
      })
    })

    test.it('should return logs filtered by ability', () => {
      return utils.request(`/logs`, {
        method: 'GET',
        query: {
          ability: abilityId
        },
        ...authenticator.credentials()
      }).then(logsResponse => {
        return Promise.all([
          test.expect(logsResponse.body.length).to.equal(2),
          test.expect(logsResponse.body[0]._ability).to.equal(abilityId),
          test.expect(logsResponse.body[1]._ability).to.equal(abilityId)
        ])
      })
    })

    test.it('should return paginated logs', () => {
      return utils.request(`/logs`, {
        method: 'GET',
        query: {
          page: 1
        },
        ...authenticator.credentials()
      }).then(logsResponse => {
        const log = logsResponse.body[2]
        return Promise.all([
          test.expect(log.type).to.equal('event'),
          test.expect(log._ability).to.not.be.undefined(),
          test.expect(log.data).to.equal('foo1@foo1.com')
        ])
      })
    })

    test.it('should return paginated logs filtered by ability', () => {
      return utils.request(`/logs`, {
        method: 'GET',
        query: {
          page: 1,
          ability: abilityId
        },
        ...authenticator.credentials()
      }).then(logsResponse => {
        return Promise.all([
          test.expect(logsResponse.body.length).to.equal(2),
          test.expect(logsResponse.body[0]._ability).to.equal(abilityId),
          test.expect(logsResponse.body[1]._ability).to.equal(abilityId)
        ])
      })
    })
  })

  test.describe('logs stats api', () => {
    test.it('should return total number of logs', () => {
      return utils.request(`/logs/stats`, {
        method: 'GET',
        ...authenticator.credentials()
      }).then(statsResponse => {
        return Promise.all([
          test.expect(statsResponse.body.total).to.equal(3)
        ])
      })
    })

    test.it('should return total number of logs filtered by ability', () => {
      return utils.request(`/logs/stats`, {
        method: 'GET',
        query: {
          ability: abilityId
        },
        ...authenticator.credentials()
      }).then(statsResponse => {
        return Promise.all([
          test.expect(statsResponse.body.total).to.equal(2)
        ])
      })
    })
  })
})
