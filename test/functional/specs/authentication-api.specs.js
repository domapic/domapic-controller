
const test = require('narval')

const utils = require('./utils')

test.describe('authentication api', function () {
  let adminRefreshToken
  let adminAccessToken
  let newUserApiKey
  const authenticator = utils.Authenticator()
  const newUser = {
    name: 'foo name',
    role: 'service',
    email: 'foo@foo.com',
    password: 'foo'
  }
  const adminUser = {
    name: 'foo admin name',
    role: 'admin',
    email: 'foo2@foo2.com',
    password: 'foo2'
  }

  const createUser = (userData = newUser) => {
    return utils.request('/users', {
      method: 'POST',
      body: userData,
      ...authenticator.credentials()
    })
  }

  const getConfig = () => {
    return utils.request('/config', {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const getAccessToken = userData => {
    return utils.request('/auth/jwt', {
      method: 'POST',
      body: userData,
      ...authenticator.credentials()
    })
  }

  const getApiKey = user => {
    return utils.request('/auth/apikey', {
      method: 'POST',
      body: {
        user
      },
      ...authenticator.credentials()
    })
  }

  const removeApiKey = apiKey => {
    return utils.request('/auth/apikey', {
      method: 'DELETE',
      body: {
        apiKey
      },
      ...authenticator.credentials()
    })
  }

  const removeRefreshToken = refreshToken => {
    return utils.request('/auth/jwt', {
      method: 'DELETE',
      body: {
        refreshToken
      },
      ...authenticator.credentials()
    })
  }

  test.describe('when no authenticated', () => {
    test.describe('config api resource', () => {
      test.it('should return an authentication error', () => {
        return getConfig().then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })
    })

    test.describe('jwt remove refresh token api resource', () => {
      test.it('should return an authentication error', () => {
        return removeRefreshToken('foo-token').then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })
    })

    test.describe('create apikey api resource', () => {
      test.it('should return an authentication error', () => {
        return getApiKey(newUser.email).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })
    })

    test.describe('jwt create accessToken api resource', () => {
      test.it('should return an authentication error if no user is provided', () => {
        return getAccessToken({
          password: 'foo-password'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })

      test.it('should return an authentication error if no password is provided', () => {
        return getAccessToken({
          user: 'foo-email'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })

      test.it('should return an authentication error if user does not exists', () => {
        return getAccessToken({
          user: 'foo-unexistant-user',
          password: 'foo-password'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Authentication required'),
            test.expect(response.statusCode).to.equal(401)
          ])
        })
      })

      test.it('should return an access token, refresh token and expiration time if user exists and password matchs', () => {
        return createUser()
          .then(() => getAccessToken({
            user: newUser.email,
            password: newUser.password
          }).then(response => {
            authenticator.login(response.body.accessToken, response.body.refreshToken)
            return Promise.all([
              test.expect(response.body).to.have.all.keys(
                'accessToken',
                'refreshToken',
                'expiresIn'
              ),
              test.expect(response.statusCode).to.equal(200)
            ])
          }))
      })

      test.it('should return an authentication error if refreshToken does not exists', () => {
        return createUser()
          .then(() => getAccessToken({
            refreshToken: 'foo-token'
          }).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Authentication required'),
              test.expect(response.statusCode).to.equal(401)
            ])
          }))
      })

      test.it('should return an access token and expiration time if a refreshToken is provided', () => {
        return createUser()
          .then(() => getAccessToken({
            refreshToken: authenticator.refreshToken()
          }).then(response => {
            authenticator.login(response.body.accessToken)
            return Promise.all([
              test.expect(response.body).to.have.all.keys(
                'accessToken',
                'expiresIn'
              ),
              test.expect(response.statusCode).to.equal(200)
            ])
          }))
      })
    })
  })

  test.describe('when authenticated using jwt', () => {
    test.describe('when user has not an "admin" role', () => {
      test.before(() => {
        return createUser(adminUser)
          .then(() => getAccessToken({
            user: adminUser.email,
            password: adminUser.password
          }).then(response => {
            adminRefreshToken = response.body.refreshToken
            adminAccessToken = response.body.accessToken
          }))
      })

      test.describe('config api resource', () => {
        test.it('should return controller configuration', () => {
          return getConfig().then(response => {
            return Promise.all([
              test.expect(response.body).to.have.all.keys(
                'color',
                'logLevel',
                'port',
                'authDisabled',
                'hostName',
                'db',
                'path'
              ),
              test.expect(response.body.authDisabled).to.deep.equal([]),
              test.expect(response.body.port).to.equal(3000),
              test.expect(response.body.color).to.equal(true),
              test.expect(response.body.logLevel).to.equal('trace'),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })

      test.describe('create apikey api resource', () => {
        test.it('should return a forbidden error if no user is provided', () => {
          return getApiKey(null).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(newUser.email).then(response => {
            newUserApiKey = response.body.apiKey
            return Promise.all([
              test.expect(newUserApiKey.length).to.equal(64),
              test.expect(typeof newUserApiKey).to.equal('string'),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })

        test.it('should return a forbidden error when trying to create a new api key for another user', () => {
          return getApiKey(adminUser.email).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })
      })

      test.describe('remove apikey api resource', () => {
        test.it('should return a forbidden error if no user is provided', () => {
          return removeApiKey(null).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to delete api keys that belong to logged user', () => {
          return removeApiKey(newUserApiKey).then(response => {
            newUserApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should not allow to delete api keys that belong to another user', () => {
          const userAccessToken = authenticator.accessToken()
          const userRefreshToken = authenticator.refreshToken()
          authenticator.login(adminAccessToken)
          return getApiKey(adminUser.email).then(response => {
            const apiKey = response.apiKey
            authenticator.login(userAccessToken, userRefreshToken)
            return removeApiKey(apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(403)
            })
          })
        })
      })

      test.describe('jwt remove refresh token api resource', () => {
        test.it('should return a forbidden error if refreshToken does not exists', () => {
          return removeRefreshToken('foo-token').then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return a forbidden error if refreshToken does not belong to current user', () => {
          return removeRefreshToken(adminRefreshToken).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to delete refresh tokens that belongs to user', () => {
          return removeRefreshToken(authenticator.refreshToken()).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should return a forbidden error if refresh token does not exist', () => {
          return removeRefreshToken(authenticator.refreshToken()).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })
      })
    })

    test.describe('when user has "admin" role', () => {
      let adminApiKey
      test.before(() => {
        return getApiKey(newUser.email).then(response => {
          newUserApiKey = response.body.apiKey
          authenticator.login(adminAccessToken)
          return Promise.resolve()
        })
      })

      test.describe('create apikey api resource', () => {
        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(adminUser.email).then(response => {
            adminApiKey = response.body.apiKey
            return test.expect(response.statusCode).to.equal(200)
          })
        })

        test.it('should allow to create api keys for any other users', () => {
          return getApiKey(newUser.email).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })
      })

      test.describe('remove apikey api resource', () => {
        test.it('should allow to delete api keys that belong to logged user', () => {
          return removeApiKey(adminApiKey).then(response => {
            adminApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should allow to delete api keys that belong to any other user', () => {
          return removeApiKey(newUserApiKey).then(response => {
            newUserApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })

      test.describe('jwt remove refresh token api resource', () => {
        test.it('should return a not found error with more detailed info if refreshToken does not exists', () => {
          return removeRefreshToken('foo-token').then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Security token not found'),
              test.expect(response.statusCode).to.equal(404)
            ])
          })
        })

        test.it('should allow to delete any refresh token', () => {
          return getAccessToken({
            user: newUser.email,
            password: newUser.password
          }).then(response => {
            return removeRefreshToken(response.body.refreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })
      })
    })
  })

  test.describe('when authenticated using apikey', () => {
    let userRefreshToken
    let userAccessToken

    test.describe('when user has not an "admin" role', () => {
      test.before(() => {
        return getAccessToken({
          user: newUser.email,
          password: newUser.password
        }).then(response => {
          userAccessToken = response.body.accessToken
          userRefreshToken = response.body.refreshToken
          authenticator.login(userAccessToken, userRefreshToken)
          return getApiKey(newUser.email).then(response => {
            authenticator.loginApiKey(response.body.apiKey)
            return Promise.resolve()
          })
        })
      })

      test.describe('config api resource', () => {
        test.it('should return controller configuration', () => {
          return getConfig().then(response => {
            return Promise.all([
              test.expect(response.body).to.have.all.keys(
                'color',
                'logLevel',
                'port',
                'authDisabled',
                'hostName',
                'db',
                'path'
              ),
              test.expect(response.body.authDisabled).to.deep.equal([]),
              test.expect(response.body.port).to.equal(3000),
              test.expect(response.body.color).to.equal(true),
              test.expect(response.body.logLevel).to.equal('trace'),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })

      test.describe('create apikey api resource', () => {
        test.it('should return a forbidden error if no user is provided', () => {
          return getApiKey(null).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(newUser.email).then(response => {
            newUserApiKey = response.body.apiKey
            return Promise.all([
              test.expect(newUserApiKey.length).to.equal(64),
              test.expect(typeof newUserApiKey).to.equal('string'),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })

        test.it('should return a forbidden error when trying to create a new api key for another user', () => {
          return getApiKey(adminUser.email).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })
      })

      test.describe('remove apikey api resource', () => {
        test.it('should return a forbidden error if no user is provided', () => {
          return removeApiKey(null).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to delete api keys that belong to logged user', () => {
          return removeApiKey(newUserApiKey).then(response => {
            newUserApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should not allow to delete api keys that belong to another user', () => {
          const apiKey = authenticator.apiKey()
          authenticator.login(adminAccessToken)
          return getApiKey(adminUser.email).then(response => {
            const adminApiKey = response.apiKey
            authenticator.loginApiKey(apiKey)
            return removeApiKey(adminApiKey).then(response => {
              return test.expect(response.statusCode).to.equal(403)
            })
          })
        })
      })

      test.describe('jwt remove refresh token api resource', () => {
        test.it('should return a forbidden error if refreshToken does not exists', () => {
          return removeRefreshToken('foo-token').then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return a forbidden error if refreshToken does not belong to current user', () => {
          return removeRefreshToken(adminRefreshToken).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to delete refresh tokens that belongs to user', () => {
          return removeRefreshToken(userRefreshToken).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should return a forbidden error if refresh token does not exist', () => {
          return removeRefreshToken(authenticator.refreshToken()).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })
      })
    })

    test.describe('when user has "admin" role', () => {
      let adminApiKey
      test.before(() => {
        return getApiKey(newUser.email).then(response => {
          newUserApiKey = response.body.apiKey
          authenticator.login(adminAccessToken)
          return getApiKey(adminUser.email).then(response => {
            authenticator.loginApiKey(response.body.apiKey)
            return Promise.resolve()
          })
        })
      })

      test.describe('create apikey api resource', () => {
        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(adminUser.email).then(response => {
            adminApiKey = response.body.apiKey
            return test.expect(response.statusCode).to.equal(200)
          })
        })

        test.it('should allow to create api keys for any other users', () => {
          return getApiKey(newUser.email).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })
      })

      test.describe('remove apikey api resource', () => {
        test.it('should allow to delete api keys that belong to logged user', () => {
          return removeApiKey(adminApiKey).then(response => {
            adminApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })

        test.it('should allow to delete api keys that belong to any other user', () => {
          return removeApiKey(newUserApiKey).then(response => {
            newUserApiKey = null
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })

      test.describe('jwt remove refresh token api resource', () => {
        test.it('should return a not found error with more detailed info if refreshToken does not exists', () => {
          return removeRefreshToken('foo-token').then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Security token not found'),
              test.expect(response.statusCode).to.equal(404)
            ])
          })
        })

        test.it('should allow to delete any refresh token', () => {
          return getAccessToken({
            user: newUser.email,
            password: newUser.password
          }).then(response => {
            return removeRefreshToken(response.body.refreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })
      })
    })
  })
})
