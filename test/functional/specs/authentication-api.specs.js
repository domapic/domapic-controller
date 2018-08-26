
const test = require('narval')

const utils = require('./utils')

test.describe('authentication api', function () {
  let adminRefreshToken
  let adminAccessToken
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

  test.describe('when authenticated', () => {
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
        return createUser(adminUser)
          .then(() => getAccessToken({
            user: adminUser.email,
            password: adminUser.password
          }).then(response => {
            adminRefreshToken = response.body.refreshToken
            adminAccessToken = response.body.accessToken
            return removeRefreshToken(adminRefreshToken).then(response => {
              return test.expect(response.statusCode).to.equal(403)
            })
          }))
      })

      test.it('should allow to delete refresh tokens that belongs to user', () => {
        return removeRefreshToken(authenticator.refreshToken()).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })

      test.it('should return a not found error with more detailed info if refreshToken does not exists and user is administrator', () => {
        authenticator.login(adminAccessToken)
        return removeRefreshToken('foo-token').then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Security token not found'),
            test.expect(response.statusCode).to.equal(404)
          ])
        })
      })

      test.it('should allow to delete any refresh token if user is administrator', () => {
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
