
const test = require('narval')

const utils = require('./utils')

test.describe('security tokens api', function () {
  let authenticator = utils.Authenticator()

  const operatorUser = {
    name: 'foo-operator',
    role: 'operator',
    email: 'operator@foo.com',
    password: 'foo'
  }

  const serviceUser = {
    name: 'foo-service-user',
    role: 'service',
    email: 'service@foo.com',
    password: 'foo'
  }

  const pluginUser = {
    name: 'foo-plugin',
    role: 'plugin',
    email: 'plugin@foo.com',
    password: 'foo'
  }

  const serviceRegistererUser = {
    name: 'foo-service-registerer',
    role: 'service-registerer',
    email: 'service-registerer@foo.com',
    password: 'foo'
  }

  const getAuthTokens = filters => {
    return utils.request('/auth/tokens', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const getUser = function (userName) {
    return utils.request(`/users/${userName}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  test.describe('get auth tokens api resource', () => {
    test.describe('when no authenticated', () => {
      test.it('should return an authentication error', () => {
        return getAuthTokens().then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })
    })

    test.describe('when user is admin', () => {
      test.before(() => {
        return utils.doLogin(authenticator)
      })

      test.it('should return all existant security tokens if no filter is received', () => {
        return getAuthTokens().then(response => {
          return test.expect(response.body.length).to.equal(2)
        })
      })

      test.it('should return all existant security tokens aplying received type filter', () => {
        const type = 'apikey'
        return getAuthTokens({
          type
        }).then(response => {
          return Promise.all([
            test.expect(response.body[0].type).to.equal(type),
            test.expect(response.body.length).to.equal(1)
          ])
        })
      })

      test.it('should return all existant security tokens aplying received user filter', () => {
        return getUser('admin')
          .then(userData => {
            return getAuthTokens({
              user: userData.body._id
            }).then(response => {
              return Promise.all([
                test.expect(response.body[0]._user).to.equal(userData.body._id),
                test.expect(response.body.length).to.equal(1)
              ])
            })
          })
      })
    })

    const testRole = function (user) {
      test.describe(`when user has role "${user.role}"`, () => {
        let adminUserId

        test.before(() => {
          return utils.doLogin(authenticator)
            .then(() => {
              return getUser('admin')
                .then((response) => {
                  adminUserId = response.body._id
                  return utils.ensureUserAndDoLogin(authenticator, user)
                })
            })
        })

        test.it('should return a forbidden error if no user query is received', () => {
          return getAuthTokens().then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return tokens if user in query is same than user id', () => {
          return getUser(user.name)
            .then(userData => {
              return getAuthTokens({
                user: userData.body._id
              }).then(response => {
                return Promise.all([
                  test.expect(response.body[0]._user).to.equal(userData.body._id),
                  test.expect(response.body.length).to.equal(1)
                ])
              })
            })
        })

        test.it('should return a forbidden error if user in query is different than user id', () => {
          return getAuthTokens({
            user: adminUserId
          }).then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })
    }

    testRole(operatorUser)
    testRole(serviceUser)
    testRole(pluginUser)
    testRole(serviceRegistererUser)

    test.describe('When user has service-registerer role and request tokens of an user different to himself', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, serviceRegistererUser)
      })

      test.it('should return a forbidden error if requested user has not a "service" role', () => {
        return utils.ensureUserAndDoLogin(authenticator, operatorUser)
          .then(() => {
            return getUser(operatorUser.name)
              .then(response => {
                const operatorId = response.body._id
                return utils.ensureUserAndDoLogin(authenticator, serviceRegistererUser)
                  .then(() => {
                    return getAuthTokens({
                      type: 'apikey',
                      user: operatorId
                    }).then((response) => {
                      return Promise.all([
                        test.expect(response.body.message).to.contain('Not authorized'),
                        test.expect(response.statusCode).to.equal(403)
                      ])
                    })
                  })
              })
          })
      })

      test.it('should return tokens data if requested user has "service" role and requested type is "apikey"', () => {
        return getUser(serviceUser.name)
          .then(response => {
            const serviceId = response.body._id
            return getAuthTokens({
              type: 'apikey',
              user: serviceId
            }).then((response) => {
              return Promise.all([
                test.expect(response.statusCode).to.equal(200),
                test.expect(response.body).to.be.an('array')
              ])
            })
          })
      })

      test.it('should return a forbidden error if requested type if different to "apikey"', () => {
        return getUser(serviceUser.name)
          .then(response => {
            const serviceId = response.body._id
            return getAuthTokens({
              type: 'jwt',
              user: serviceId
            }).then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.contain('Not authorized'),
                test.expect(response.statusCode).to.equal(403)
              ])
            })
          })
      })
    })
  })
})
