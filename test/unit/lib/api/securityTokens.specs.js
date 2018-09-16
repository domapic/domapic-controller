
const test = require('narval')

const mocks = require('../../mocks')

const securityTokens = require('../../../../lib/api/securityTokens')
const definition = require('../../../../lib/api/securityTokens.json')

test.describe('securityTokens users', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = securityTokens.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getSecurityTokens auth', () => {
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.getSecurityTokens.auth({
          role: 'admin',
          _id: ''
        }, {
          query: {}
        }, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role and no query is received`, () => {
          test.expect(operations.getSecurityTokens.auth({
            role,
            _id: ''
          }, {
            query: {
            }
          }, {})).to.be.false()
        })
      }

      testRole('service')
      testRole('operator')
      testRole('plugin')
      testRole('service-registerer')

      test.it('should return true if provided user has same id than received user in query', () => {
        const fooId = 'foo-id'
        test.expect(operations.getSecurityTokens.auth({
          _id: fooId
        }, {
          query: {
            user: fooId
          }
        }, {})).to.be.true()
      })

      test.describe('when user has service-registerer role, and query type is apikey', () => {
        test.it('should resolve the promise if received user in query has "service" role', () => {
          commandsMocks.stubs.user.get.resolves({
            role: 'service'
          })
          return operations.getSecurityTokens.auth({ role: 'service-registerer', _id: '' }, { query: {
            type: 'apikey',
            user: 'foo-id'
          }}, {}).then(result => {
            return test.expect(true).to.be.true()
          })
        })

        test.it('should reject the promise if received user in query has a role different to "service"', () => {
          const forbiddenError = new Error('forbidden')
          commandsMocks.stubs.user.get.resolves({
            role: 'admin'
          })
          baseMocks.stubs.service.errors.Forbidden.returns(forbiddenError)
          return operations.getSecurityTokens.auth({ role: 'service-registerer', _id: '' }, { query: {
            type: 'apikey',
            user: 'foo-id'
          }}, {}).then(result => {
            return test.assert.fail()
          }, (error) => {
            return test.expect(error).to.equal(forbiddenError)
          })
        })
      })
    })

    test.describe('getSecurityTokens handler', () => {
      test.it('should return all security tokens if no query is received', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.securityToken.getFiltered.resolves(fooResult)

        return operations.getSecurityTokens.handler({
          query: {}
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.securityToken.getFiltered).to.have.been.calledWith({})
            ])
          })
      })

      test.it('should pass type query as a filter if it is received', () => {
        const fooType = 'foo type'
        return operations.getSecurityTokens.handler({
          query: {
            type: fooType
          }
        }).then(() => test.expect(commandsMocks.stubs.securityToken.getFiltered).to.have.been.calledWith({
          type: fooType
        }))
      })

      test.it('should pass user query as a filter if it is received', () => {
        const fooUser = 'foo type'
        return operations.getSecurityTokens.handler({
          query: {
            user: fooUser
          }
        }).then(() => test.expect(commandsMocks.stubs.securityToken.getFiltered).to.have.been.calledWith({
          _user: fooUser
        }))
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(securityTokens.openapi()).to.deep.equal([definition])
    })
  })
})
