
const test = require('narval')

const mocks = require('../../mocks')

const Security = require('../../../../lib/security/jwt')

test.describe('jwt security', () => {
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
    test.describe('authenticate handler', () => {
      test.describe('when a refresh token is provided', () => {
        test.it('should get user from refresh token, then clean user data and return it', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            _id: 'fooId',
            name: 'fooName',
            email: 'fooEmail',
            role: 'fooRole',
            password: 'fooPassword'
          })
          return security.authenticateHandler(null, {
            refreshToken: 'fooRefreshToken'
          }).then(result => {
            return Promise.all([
              test.expect(commandsMocks.stubs.securityToken.getUser).to.have.been.calledWith('fooRefreshToken'),
              test.expect(result).to.deep.equal({
                userData: {
                  _id: 'fooId',
                  name: 'fooName',
                  email: 'fooEmail',
                  role: 'fooRole'
                }
              })
            ])
          })
        })

        test.it('should reject the promise if an error is returned during the process', () => {
          const fooError = new Error('foo error')
          commandsMocks.stubs.securityToken.getUser.rejects(fooError)
          return security.authenticateHandler(null, {
            refreshToken: 'fooRefreshToken'
          }).then(() => {
            return test.assert.fail()
          }, error => {
            return Promise.all([
              test.expect(commandsMocks.stubs.securityToken.getUser).to.have.been.calledWith('fooRefreshToken'),
              test.expect(error).to.equal(fooError)
            ])
          })
        })
      })

      test.describe('when user data is provided', () => {
        test.it('should get user, then add a refresh token for that user, then return the user and refresh token', () => {
          const fooUserData = {
            _id: 'fooId',
            name: 'fooName',
            email: 'fooEmail',
            role: 'fooRole',
            password: 'fooPassword'
          }
          commandsMocks.stubs.user.get.resolves(fooUserData)
          commandsMocks.stubs.securityToken.add.resolves({
            _user: 'fooId',
            token: 'fooToken'
          })
          return security.authenticateHandler(null, {
            user: 'fooUser',
            password: 'fooPassword'
          }).then(result => {
            return Promise.all([
              test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
                email: 'fooUser',
                password: 'fooPassword'
              }),
              test.expect(commandsMocks.stubs.securityToken.add).to.have.been.calledWith(fooUserData),
              test.expect(result).to.deep.equal({
                userData: {
                  _id: 'fooId',
                  name: 'fooName',
                  email: 'fooEmail',
                  role: 'fooRole'
                },
                refreshToken: 'fooToken'
              })
            ])
          })
        })

        test.it('should reject the promise if an error is returned during the process', () => {
          const fooError = new Error('foo error')
          commandsMocks.stubs.user.get.rejects(fooError)
          return security.authenticateHandler(null, {
            user: 'fooUser',
            password: 'fooPassword'
          }).then(() => {
            return test.assert.fail()
          }, error => {
            return Promise.all([
              test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
                email: 'fooUser',
                password: 'fooPassword'
              }),
              test.expect(error).to.equal(fooError)
            ])
          })
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
        test.it('should get user data from refresh token and resolve the promise if the token belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            email: 'fooEmail'
          })
          return security.revokeAuth({email: 'fooEmail'}, {}, {refreshToken: 'fooRefreshToken'})
            .then(() => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should get user data from refresh token and reject the promise if the token do not belongs to himself', () => {
          commandsMocks.stubs.securityToken.getUser.resolves({
            email: 'fooEmail'
          })
          return security.revokeAuth({email: 'fooDifferentEmail'}, {}, {refreshToken: 'fooRefreshToken'})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })

        test.it('should reject the promise if retrieving user data returns an error', () => {
          commandsMocks.stubs.securityToken.getUser.rejects(new Error())
          return security.revokeAuth({email: 'fooEmail'}, {}, {refreshToken: 'fooRefreshToken'})
            .then(() => {
              return test.assert.fail()
            }, () => {
              return test.expect(true).to.be.true()
            })
        })
      })
    })

    test.describe('revoke handler', () => {
      test.it('should call to remove refresh token', () => {
        const fooToken = 'fooRefreshToken'
        commandsMocks.stubs.securityToken.remove.resolves()
        return security.revokeHandler(null, {refreshToken: fooToken})
          .then(() => {
            return test.expect(commandsMocks.stubs.securityToken.remove).to.have.been.calledWith(fooToken)
          })
      })

      test.it('should reject the promise if remove refresh token returns an error', () => {
        const fooError = new Error('foo error')
        commandsMocks.stubs.securityToken.remove.rejects(fooError)
        return security.revokeHandler(null, {refreshToken: 'fooToken'})
          .then(() => {
            return test.assert.fail()
          }, error => {
            return test.expect(error).to.equal(fooError)
          })
      })
    })
  })
})
