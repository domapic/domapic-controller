
const test = require('narval')

const utils = require('./utils')

test.describe('server', function () {
  test.it('should have printed a log with the service-registerer api key', () => {
    return utils.readLogs()
      .then((log) => {
        return test.expect(log).to.contain(`Use the next api key to register services:`)
      })
  })

  test.describe('when using service-registerer api key', () => {
    const authenticator = utils.Authenticator()
    let apiKey

    const fooModuleUser = {
      name: 'foo-module-name',
      role: 'module'
    }

    const getUsers = function (query) {
      return utils.request('/users', {
        method: 'GET',
        query,
        ...authenticator.credentials()
      })
    }

    const getUserMe = function () {
      return utils.request(`/users/me`, {
        method: 'GET',
        ...authenticator.credentials()
      })
    }

    const addApiKey = user => {
      return utils.request('/auth/apikey', {
        method: 'POST',
        body: {
          user
        },
        ...authenticator.credentials()
      })
    }

    test.before(() => {
      return utils.readLogs()
        .then((log) => {
          apiKey = /Use the next api key to register services: (\S*)\n/.exec(log)[1]
          authenticator.loginApiKey('service-registerer', apiKey)
        })
    })

    test.it('should be able to add module users', () => {
      return utils.createUser(authenticator, fooModuleUser).then((response) => {
        return test.expect(response.statusCode).to.equal(201)
      })
    })

    test.it('should be able to add apiKeys for module users', () => {
      return utils.ensureUserAndDoLogin(authenticator, fooModuleUser)
        .then(() => {
          return getUserMe().then((response) => {
            const userId = response.body._id
            authenticator.loginApiKey('service-registerer', apiKey)
            return addApiKey(userId).then((response) => {
              return Promise.all([
                test.expect(response.statusCode).to.equal(200),
                test.expect(response.body.apiKey).to.not.be.undefined()
              ])
            })
          })
        })
    })

    test.it('should not be able to add apiKeys for another users', () => {
      return utils.doLogin(authenticator)
        .then(() => {
          return getUserMe().then((response) => {
            const userId = response.body._id
            authenticator.loginApiKey('service-registerer', apiKey)
            return addApiKey(userId).then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.contain('Not authorized'),
                test.expect(response.statusCode).to.equal(403)
              ])
            })
          })
        })
    })

    test.it('should not be able to add admin users', () => {
      return utils.createUser(authenticator, {
        name: 'foo-admin-name',
        email: 'foo-admin@foo-admin.com',
        password: 'foo-password',
        role: 'admin'
      }).then((response) => {
        return Promise.all([
          test.expect(response.body.message).to.contain('Not authorized'),
          test.expect(response.statusCode).to.equal(403)
        ])
      })
    })

    test.it('should be able to get module users', () => {
      return getUsers({
        role: 'module'
      }).then((response) => {
        return test.expect(response.statusCode).to.equal(200)
      })
    })

    test.it('should not be able to get users without role filter', () => {
      return getUsers().then((response) => {
        return Promise.all([
          test.expect(response.body.message).to.contain('Not authorized'),
          test.expect(response.statusCode).to.equal(403)
        ])
      })
    })
  })
})
