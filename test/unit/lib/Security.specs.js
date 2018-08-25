
const test = require('narval')

const mocks = require('../mocks')

const Security = require('../../../lib/Security')

test.describe('Security', () => {
  let baseMocks
  let commandsMocks
  let security

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    security = Security(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('jwt authentication methods', () => {
      test.describe('authenticate handler', () => {
        test.describe('when a refresh token is provided', () => {
          test.it('should get user from refresh token, then clean user data and return it', () => {
            commandsMocks.stubs.refreshToken.getUser.resolves({
              _id: 'fooId',
              name: 'fooName',
              email: 'fooEmail',
              role: 'fooRole',
              password: 'fooPassword'
            })
            return security.methods.jwt.authenticate.handler({
              refreshToken: 'fooRefreshToken'
            }).then(result => {
              return Promise.all([
                test.expect(commandsMocks.stubs.refreshToken.getUser).to.have.been.calledWith('fooRefreshToken'),
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
            commandsMocks.stubs.refreshToken.getUser.rejects(fooError)
            return security.methods.jwt.authenticate.handler({
              refreshToken: 'fooRefreshToken'
            }).then(() => {
              return test.assert.fail()
            }, error => {
              return Promise.all([
                test.expect(commandsMocks.stubs.refreshToken.getUser).to.have.been.calledWith('fooRefreshToken'),
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
            commandsMocks.stubs.refreshToken.add.resolves({
              _user: 'fooId',
              token: 'fooToken'
            })
            return security.methods.jwt.authenticate.handler({
              user: 'fooUser',
              password: 'fooPassword'
            }).then(result => {
              return Promise.all([
                test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
                  email: 'fooUser',
                  password: 'fooPassword'
                }),
                test.expect(commandsMocks.stubs.refreshToken.add).to.have.been.calledWith(fooUserData),
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
            return security.methods.jwt.authenticate.handler({
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
          test.expect(security.methods.jwt.revoke.auth({
            role: 'admin'
          })).to.be.true()
        })

        test.describe('when user is not an administrator', () => {
          test.it('should get user data from refresh token and resolve the promise if the token belongs to himself', () => {
            commandsMocks.stubs.refreshToken.getUser.resolves({
              email: 'fooEmail'
            })
            return security.methods.jwt.revoke.auth({email: 'fooEmail'}, {}, {refreshToken: 'fooRefreshToken'})
              .then(() => {
                return test.expect(true).to.be.true()
              })
          })

          test.it('should get user data from refresh token and reject the promise if the token do not belongs to himself', () => {
            commandsMocks.stubs.refreshToken.getUser.resolves({
              email: 'fooEmail'
            })
            return security.methods.jwt.revoke.auth({email: 'fooDifferentEmail'}, {}, {refreshToken: 'fooRefreshToken'})
              .then(() => {
                return test.assert.fail()
              }, () => {
                return test.expect(true).to.be.true()
              })
          })

          test.it('should reject the promise if retrieving user data returns an error', () => {
            commandsMocks.stubs.refreshToken.getUser.rejects(new Error())
            return security.methods.jwt.revoke.auth({email: 'fooEmail'}, {}, {refreshToken: 'fooRefreshToken'})
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
          commandsMocks.stubs.refreshToken.remove.resolves()
          return security.methods.jwt.revoke.handler({refreshToken: fooToken})
            .then(() => {
              return test.expect(commandsMocks.stubs.refreshToken.remove).to.have.been.calledWith(fooToken)
            })
        })

        test.it('should reject the promise if remove refresh token returns an error', () => {
          const fooError = new Error('foo error')
          commandsMocks.stubs.refreshToken.remove.rejects(fooError)
          return security.methods.jwt.revoke.handler({refreshToken: 'fooToken'})
            .then(() => {
              return test.assert.fail()
            }, error => {
              return test.expect(error).to.equal(fooError)
            })
        })
      })
    })
  })
})
