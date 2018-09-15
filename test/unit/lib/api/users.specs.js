
const test = require('narval')

const mocks = require('../../mocks')

const users = require('../../../../lib/api/users')
const definition = require('../../../../lib/api/users.json')

test.describe('api users', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = users.Operations(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
    })

    test.describe('getUsers auth', () => {
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.getUsers.auth({
          role: 'admin'
        }, {}, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.getUsers.auth({
            role
          }, {}, {})).to.be.false()
        })
      }

      testRole('service')
      testRole('operator')
      testRole('plugin')
      testRole('service-registerer')
    })

    test.describe('getUsers handler', () => {
      test.it('should return all users, calling to correspondant command', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.user.getAll.resolves(fooResult)

        return operations.getUsers.handler()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.getAll).to.have.been.called()
            ])
          })
      })
    })

    test.describe('getUser auth', () => {
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.getUser.auth({
          role: 'admin'
        }, {}, {})).to.be.true()
      })

      const testRole = function (role) {
        test.it(`should reject the promise if provided user has "${role}" role and requested user is different to himself`, () => {
          commandsMocks.stubs.user.get.resolves({
            _id: 'foo-different-id'
          })
          return operations.getUser.auth({
            _id: 'foo-id',
            role
          }, {
            path: {
              name: 'foo-name'
            }
          }, {}).then(() => {
            return test.assert.fail()
          }, (error) => {
            return test.expect(error).to.be.an.instanceof(Error)
          })
        })

        test.it(`should resolve the promise if provided user has "${role}" role and requested user is same to himself`, () => {
          const fooId = 'foo-id'
          commandsMocks.stubs.user.get.resolves({
            _id: fooId
          })
          return operations.getUser.auth({
            _id: fooId,
            role
          }, {
            path: {
              name: 'foo-name'
            }
          }, {}).then(() => {
            return test.expect(true).to.be.true()
          })
        })
      }
      testRole('service')
      testRole('operator')
      testRole('plugin')
      testRole('service-registerer')

      test.describe('when logged user has service-registerer role', () => {
        test.it('should resolve the promise if provided user has "service" role', () => {
          commandsMocks.stubs.user.get.resolves({
            _id: 'foo-id',
            role: 'service'
          })
          return operations.getUser.auth({
            role: 'service-registerer'
          }, {
            path: {
              name: 'foo-name'
            }
          }, {}).then(() => {
            return test.expect(true).to.be.true()
          })
        })

        test.it('should reject the promise if provided user has a role different to "service"', () => {
          commandsMocks.stubs.user.get.resolves({
            _id: 'foo-id',
            role: 'operator'
          })
          return operations.getUser.auth({
            role: 'service-registerer'
          }, {
            path: {
              name: 'foo-name'
            }
          }, {}).then(() => {
            return test.assert.fail()
          }, (error) => {
            return test.expect(error).to.be.an.instanceof(Error)
          })
        })
      })
    })

    test.describe('getUser handler', () => {
      test.it('should return user, calling to correspondant command', () => {
        const fooName = 'foo-name'
        const fooResult = 'foo result'
        commandsMocks.stubs.user.get.resolves(fooResult)

        return operations.getUser.handler({
          path: {
            name: fooName
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
                name: fooName
              })
            ])
          })
      })
    })

    test.describe('addUser auth', () => {
      test.it('should return true if provided user has "admin" role', () => {
        test.expect(operations.addUser.auth({
          role: 'admin'
        }, {}, {})).to.be.true()
      })

      test.it('should return true if provided user has "service-registerer" role and body user has "service" role', () => {
        test.expect(operations.addUser.auth({
          role: 'service-registerer'
        }, {}, {
          role: 'service'
        })).to.be.true()
      })

      test.it('should return false if provided user has "service-registerer" role and body user has a role different to service', () => {
        test.expect(operations.addUser.auth({
          role: 'service-registerer'
        }, {}, {
          role: 'admin'
        })).to.be.false()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addUser.auth({
            role
          }, {}, {})).to.be.false()
        })
      }
      testRole('service')
      testRole('operator')
      testRole('plugin')
    })

    test.describe('addUser handler', () => {
      const fooUser = {
        _id: 'foo-id',
        name: 'foo-name'
      }
      const fooBody = {
        name: 'foo'
      }
      let sandbox
      let response

      test.beforeEach(() => {
        sandbox = test.sinon.createSandbox()
        response = {
          status: sandbox.stub(),
          header: sandbox.stub()
        }
        commandsMocks.stubs.user.add.resolves(fooUser)
      })

      test.afterEach(() => {
        sandbox.restore()
      })

      test.it('should call to add user, passing the received body', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(commandsMocks.stubs.user.add).to.have.been.calledWith(fooBody)
          })
      })

      test.it('should add a 201 header to response', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.status).to.have.been.calledWith(201)
          })
      })

      test.it('should set the response header with the user name', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/users/foo-name')
          })
      })

      test.it('should resolve the promise with no value', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then((result) => {
            return test.expect(result).to.be.undefined()
          })
      })
    })
  })

  test.describe('openapi', () => {
    test.it('should return an array containing the openapi definition', () => {
      test.expect(users.openapi()).to.deep.equal([definition])
    })
  })
})
