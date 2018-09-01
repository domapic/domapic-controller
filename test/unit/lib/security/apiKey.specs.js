
const test = require('narval')

const mocks = require('../../mocks')

const Security = require('../../../../lib/security/apiKey')

test.describe('apiKey security', () => {
  let baseMocks
  let commandsMocks
  let security

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    security = Security.Methods(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
  })

  test.describe('Methods', () => {
    test.describe('verify handler', () => {
      test.it('should get user from apiKey, then clean user data and return it', () => {
        const fooApiKey = 'fooApiKey'
        commandsMocks.stubs.securityToken.getUser.resolves({
          _id: 'fooId',
          name: 'fooName',
          email: 'fooEmail',
          role: 'fooRole',
          password: 'fooPassword'
        })
        return security.verify(fooApiKey).then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.securityToken.getUser).to.have.been.calledWith(fooApiKey),
            test.expect(result).to.deep.equal({
              _id: 'fooId',
              name: 'fooName',
              email: 'fooEmail',
              role: 'fooRole'
            })
          ])
        })
      })
    })

    test.describe('authenticate auth', () => {
      test.it('should return true when user has role "admin"', () => {
        test.expect(security.authenticateAuth({
          role: 'admin'
        })).to.be.true()
      })

      test.describe('when user is not an administrator', () => {
        test.it('should resolve the promise if provided user matches with logged user name', () => {
          return security.authenticateAuth({name: 'foo-name'}, {}, {user: 'foo-name'})
            .then(() => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should reject the promise if provided user does not match with logged user name', () => {
          return security.authenticateAuth({name: 'foo-different-name'}, {}, {user: 'foo-name'})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })
      })
    })

    test.describe('authenticate handler', () => {
      test.it('should add an api key for received user, then return the api key', () => {
        const fooUserData = {
          _id: 'fooId',
          name: 'foo-name',
          email: 'fooEmail',
          role: 'fooRole',
          password: 'fooPassword'
        }
        const fooApiKey = {
          _user: 'fooId',
          token: 'fooToken'
        }
        commandsMocks.stubs.user.get.resolves(fooUserData)
        commandsMocks.stubs.securityToken.add.resolves(fooApiKey)
        return security.authenticateHandler(null, {
          user: 'foo-name'
        }, null, fooUserData).then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
              name: 'foo-name'
            }),
            test.expect(commandsMocks.stubs.securityToken.add).to.have.been.calledWith(fooUserData, 'apikey'),
            test.expect(result).to.equal(fooApiKey.token)
          ])
        })
      })
    })

    test.describe('revoke auth', () => {
      test.it('should return true when user has role "admin"', () => {
        test.expect(security.revokeAuth({
          role: 'admin'
        })).to.be.true()
      })

      test.describe('when user is not an administrator', () => {
        test.it('should get user data from api key and resolve the promise if the token belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            name: 'foo-name'
          })
          return security.revokeAuth({name: 'foo-name'}, {}, {apiKey: 'fooApiKey'})
            .then(() => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should get user data from refresh token and reject the promise if the token do not belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            name: 'foo-name'
          })
          return security.revokeAuth({name: 'foo-different-name'}, {}, {apiKey: 'apiKey'})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should reject the promise if retrieving user data returns an error', () => {
          commandsMocks.stubs.securityToken.getUser.rejects(new Error())
          return security.revokeAuth({name: 'foo-name'}, {}, {apiKey: 'apiKey'})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })
      })
    })

    test.describe('revoke handler', () => {
      test.it('should call to remove api key', () => {
        const fooToken = 'fooApiKey'
        commandsMocks.stubs.securityToken.remove.resolves()
        return security.revokeHandler(null, {apiKey: fooToken})
          .then(() => {
            return test.expect(commandsMocks.stubs.securityToken.remove).to.have.been.calledWith(fooToken)
          })
      })

      test.it('should reject the promise if remove refresh token returns an error', () => {
        const fooError = new Error('foo error')
        commandsMocks.stubs.securityToken.remove.rejects(fooError)
        return security.revokeHandler(null, {apiKey: 'fooToken'})
          .then(() => {
            return test.assert.fail()
          }, error => {
            return test.expect(error).to.equal(fooError)
          })
      })
    })
  })
})
