
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
      test.it('should resolve when user has role "admin"', () => {
        return security.authenticateAuth({
          role: 'admin'
        }).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.describe('when user has service-registerer role', () => {
        const testAllowedRole = function(role) {
          test.it(`should resolve the promise if provided user has service ${role}`, () => {
            const fooUserData = {
              role
            }
            commandsMocks.stubs.user.getById.resolves(fooUserData)
            return security.authenticateAuth({
              role: 'service-registerer',
              _id: 'foo-user-id'
            }, {}, {user: 'foo-id'})
              .then(() => {
                return test.expect(true).to.be.true()
              })
          })
        }
        testAllowedRole('module')
        testAllowedRole('plugin')

        const testForbiddenRole = function(role) {
          test.it(`should reject the promise if provided has ${role} role`, () => {
            const fooUserData = {
              role
            }
            commandsMocks.stubs.user.getById.resolves(fooUserData)
            return security.authenticateAuth({
              role: 'service-registerer',
              _id: 'foo-user-id'
            }, {}, {user: 'foo-id'})
              .then(() => {
                return test.assert.fail()
              }, () => {
                return test.expect(true).to.be.true()
              })
          })
        }
        testForbiddenRole('operator')
        testForbiddenRole('service-registerer')
        testForbiddenRole('admin')
      })

      test.describe('when user is not an administrator or service-registerer', () => {
        test.it('should resolve the promise if provided user matches with logged user name', () => {
          return security.authenticateAuth({_id: 'foo-id'}, {}, {user: 'foo-id'})
            .then(() => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should reject the promise if provided user does not match with logged user', () => {
          return security.authenticateAuth({_id: 'foo-different-id'}, {}, {user: 'foo-other-id'})
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
        commandsMocks.stubs.user.getById.resolves(fooUserData)
        commandsMocks.stubs.securityToken.add.resolves(fooApiKey)
        return security.authenticateHandler(null, {
          user: 'foo-id'
        }, null, fooUserData).then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.user.getById).to.have.been.calledWith('foo-id'),
            test.expect(commandsMocks.stubs.securityToken.add).to.have.been.calledWith(fooUserData, 'apiKey'),
            test.expect(result).to.equal(fooApiKey.token)
          ])
        })
      })
    })

    test.describe('revoke auth', () => {
      test.it('should return true when user has role "admin"', () => {
        test.expect(security.revokeAuth({
          role: 'admin'
        }, {
          path: {}
        })).to.be.true()
      })

      test.describe('when user is not an administrator', () => {
        test.it('should get user data from api key and resolve the promise if the token belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            _id: 'foo-id'
          })
          return security.revokeAuth({_id: 'foo-id'}, {path: {apiKey: 'fooApiKey'}})
            .then(() => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should get user data from refresh token and reject the promise if the token do not belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            _id: 'foo-id'
          })
          return security.revokeAuth({_id: 'foo-different-id'}, {path: {apiKey: 'apiKey'}})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should reject the promise if retrieving user data returns an error', () => {
          commandsMocks.stubs.securityToken.getUser.rejects(new Error())
          return security.revokeAuth({name: 'foo-name'}, {path: {apiKey: 'apiKey'}})
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
        return security.revokeHandler({path: {apiKey: fooToken}})
          .then(() => {
            return test.expect(commandsMocks.stubs.securityToken.remove).to.have.been.calledWith(fooToken)
          })
      })

      test.it('should reject the promise if remove refresh token returns an error', () => {
        const fooError = new Error('foo error')
        commandsMocks.stubs.securityToken.remove.rejects(fooError)
        return security.revokeHandler({path: {apiKey: 'fooToken'}})
          .then(() => {
            return test.assert.fail()
          }, error => {
            return test.expect(error).to.equal(fooError)
          })
      })
    })
  })
})
