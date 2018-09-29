
const test = require('narval')

const utils = require('./utils')

test.describe('authentication api', function () {
  let newUserId
  let adminUserId
  const authenticator = utils.Authenticator()
  const newUser = {
    name: 'foo-user',
    role: 'service',
    email: 'foo@foo.com',
    password: 'foo'
  }
  const adminUser = {
    name: 'administrator',
    role: 'admin',
    email: 'foo2@foo2.com',
    password: 'foo2'
  }

  const getConfig = () => {
    return utils.request('/config', {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const getAccessToken = userData => {
    return utils.getAccessToken(authenticator, userData)
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

  const getUserMe = () => {
    return utils.request('/users/me', {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const forceCreateUser = (userData = newUser) => {
    return utils.ensureUserAndDoLogin(authenticator, userData)
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
        return getApiKey(newUserId).then(response => {
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
          user: 'foo-name'
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
        return forceCreateUser()
          .then(() => getAccessToken({
            user: newUser.name,
            password: newUser.password
          }).then(response => {
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
        return forceCreateUser()
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
        return forceCreateUser()
          .then(() => getAccessToken({
            user: newUser.name,
            password: newUser.password
          }))
          .then(response => getAccessToken({
            refreshToken: response.body.refreshToken
          }))
          .then(response => {
            return Promise.all([
              test.expect(response.body).to.have.all.keys(
                'accessToken',
                'expiresIn'
              ),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
      })
    })
  })

  test.describe('when authenticated using jwt', () => {
    test.describe('when user has not an "admin" role', () => {
      test.before(() => {
        return forceCreateUser(adminUser)
          .then(() => {
            return getUserMe()
              .then(response => {
                adminUserId = response.body._id
                return Promise.resolve()
              })
          })
          .then(() => forceCreateUser(newUser))
          .then(() => getAccessToken({
            user: newUser.name,
            password: newUser.password
          }).then(response => {
            authenticator.login(newUser.name, response.body.accessToken, response.body.refreshToken)
            return getUserMe()
              .then(response => {
                newUserId = response.body._id
                return Promise.resolve()
              })
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
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })

      test.describe('create apiKey api resource', () => {
        test.it('should return a forbidden error if no user is provided', () => {
          return getApiKey(null).then(response => {
            return test.expect(response.statusCode).to.equal(403)
          })
        })

        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(newUserId).then(response => {
            return Promise.all([
              test.expect(response.body.apiKey.length).to.equal(64),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })

        test.it('should return a forbidden error when trying to create a new api key for another user', () => {
          return getApiKey(adminUserId).then(response => {
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
          return getApiKey(newUserId)
            .then(response => {
              return removeApiKey(response.body.apiKey).then(response => {
                return test.expect(response.statusCode).to.equal(204)
              })
            })
        })

        test.it('should not allow to delete api keys that belong to another user', () => {
          const tokens = authenticator.current()
          return getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            authenticator.login(adminUser.name, response.body.accessToken, response.body.refreshToken)
            return getApiKey(adminUserId).then(response => {
              const apiKey = response.apiKey
              authenticator.login(tokens.name, tokens.accessToken, tokens.refreshToken)
              return removeApiKey(apiKey).then(response => {
                return test.expect(response.statusCode).to.equal(403)
              })
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
          return getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            return removeRefreshToken(response.body.refreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(403)
            })
          })
        })

        test.it('should allow to delete refresh tokens that belongs to user', () => {
          return removeRefreshToken(authenticator.current().refreshToken).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })
    })

    test.describe('when user has "admin" role', () => {
      test.before(() => {
        return forceCreateUser(newUser)
          .then(() => forceCreateUser(adminUser))
          .then(() => getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            authenticator.login(adminUser.name, response.body.accessToken, response.body.refreshToken)
            return Promise.resolve()
          }))
      })

      test.describe('create apikey api resource', () => {
        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(adminUserId).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })

        test.it('should allow to create api keys for any other users', () => {
          return getApiKey(newUserId).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })
      })

      test.describe('remove apiKey api resource', () => {
        test.it('should allow to delete api keys that belong to logged user', () => {
          return getApiKey(adminUserId).then(response => {
            return removeApiKey(response.body.apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })

        test.it('should allow to delete api keys that belong to any other user', () => {
          return getApiKey(newUserId).then(response => {
            return removeApiKey(response.body.apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
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
            user: newUser.name,
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

  test.describe('when authenticated using apiKey', () => {
    test.describe('when user has not an "admin" role', () => {
      test.before(() => {
        return forceCreateUser(adminUser)
          .then(() => forceCreateUser(newUser))
          .then(() => getAccessToken({
            user: newUser.name,
            password: newUser.password
          }).then(response => {
            authenticator.login(newUser.name, response.body.accessToken, response.body.refreshToken)
            return getApiKey(newUserId).then(response => {
              authenticator.loginApiKey(newUser.name, response.body.apiKey)
              return Promise.resolve()
            })
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
          return getApiKey(newUserId).then(response => {
            return Promise.all([
              test.expect(response.body.apiKey.length).to.equal(64),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })

        test.it('should return a forbidden error when trying to create a new api key for another user', () => {
          return getApiKey(adminUserId).then(response => {
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
          return getApiKey(newUserId).then(response => {
            return removeApiKey(response.body.apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })

        test.it('should not allow to delete api keys that belong to another user', () => {
          const current = authenticator.current()
          return getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            authenticator.login(adminUser.name, response.body.accessToken, response.body.refreshToken)
            return getApiKey(adminUserId).then(response => {
              authenticator.loginApiKey(current.name, current.apiKey)
              return removeApiKey(response.body.apiKey).then(response => {
                return test.expect(response.statusCode).to.equal(403)
              })
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
          return getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            return removeRefreshToken(response.body.refreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(403)
            })
          })
        })

        test.it('should allow to delete refresh tokens that belongs to user', () => {
          return getAccessToken({
            user: newUser.name,
            password: newUser.password
          }).then((response) => {
            return removeRefreshToken(response.body.refreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })
      })
    })

    test.describe('when user has "admin" role', () => {
      test.before(() => {
        return forceCreateUser(newUser)
          .then(() => forceCreateUser(adminUser))
          .then(() => getAccessToken({
            user: adminUser.name,
            password: adminUser.password
          }).then(response => {
            authenticator.login(adminUser.name, response.body.accessToken, response.body.refreshToken)
            return getApiKey(adminUserId).then(response => {
              authenticator.loginApiKey(adminUser.name, response.body.apiKey)
              return Promise.resolve()
            })
          }))
      })

      test.describe('create apikey api resource', () => {
        test.it('should allow to create api keys for current logged user', () => {
          return getApiKey(adminUserId).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })

        test.it('should allow to create api keys for any other users', () => {
          return getApiKey(newUserId).then(response => {
            return test.expect(response.statusCode).to.equal(200)
          })
        })
      })

      test.describe('remove apikey api resource', () => {
        test.it('should allow to delete api keys that belong to logged user', () => {
          return getApiKey(adminUserId).then(response => {
            return removeApiKey(response.body.apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
          })
        })

        test.it('should allow to delete api keys that belong to any other user', () => {
          return getApiKey(newUserId).then(response => {
            return removeApiKey(response.body.apiKey).then(response => {
              return test.expect(response.statusCode).to.equal(204)
            })
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
            user: newUser.name,
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
