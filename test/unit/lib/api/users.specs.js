
const test = require('narval')

const mocks = require('../../mocks')

const users = require('../../../../lib/api/users')
const definition = require('../../../../lib/api/users.json')

test.describe('users api', () => {
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

      test.it('should return true if provided user has "service-registerer" role and received role in query is "module"', () => {
        test.expect(operations.getUsers.auth({
          role: 'service-registerer'
        }, {
          query: {
            role: 'module'
          }
        }, {})).to.be.true()
      })

      test.it('should return false if provided user has "service-registerer" role and received role in query is different to "module"', () => {
        test.expect(operations.getUsers.auth({
          role: 'service-registerer'
        }, {
          query: {
            role: 'admin'
          }
        }, {})).to.be.false()
      })

      test.it('should return false if provided user has "service-registerer" role and no role query is received', () => {
        test.expect(operations.getUsers.auth({
          role: 'service-registerer'
        }, {
          query: {}
        }, {})).to.be.false()
      })

      const testRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.getUsers.auth({
            role
          }, {
            query: {}
          }, {})).to.be.false()
        })
      }

      testRole('module')
      testRole('operator')
      testRole('plugin')
    })

    test.describe('getUsers handler', () => {
      test.it('should return all users, calling to correspondant command', () => {
        const fooResult = 'foo result'
        commandsMocks.stubs.user.getFiltered.resolves(fooResult)

        return operations.getUsers.handler({query: {}})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.getFiltered).to.have.been.called()
            ])
          })
      })

      test.it('should pass received query data to get users command', () => {
        const fooResult = 'foo result'
        const fooQuery = {
          name: 'foo-name',
          role: 'foo-role'
        }
        commandsMocks.stubs.user.getFiltered.resolves(fooResult)

        return operations.getUsers.handler({query: fooQuery})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.getFiltered).to.have.been.calledWith(fooQuery)
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

      test.it('should return true if provided user id is same than logged user', () => {
        test.expect(operations.getUser.auth({
          role: 'plugin',
          _id: 'foo-id'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {})).to.be.true()
      })

      test.it('should return false if provided user id is different than logged user', () => {
        test.expect(operations.getUser.auth({
          role: 'module',
          _id: 'foo-id'
        }, {
          path: {
            id: 'foo-different-id'
          }
        }, {})).to.be.false()
      })
    })

    test.describe('getUser handler', () => {
      test.it('should return user, calling to getById command', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.user.getById.resolves(fooResult)

        return operations.getUser.handler({
          path: {
            id: fooId
          }})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.getById).to.have.been.calledWith(fooId)
            ])
          })
      })
    })

    test.describe('getUserMe handler', () => {
      test.it('should return user, calling to getById command, passing the received userData _id', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo result'
        commandsMocks.stubs.user.getById.resolves(fooResult)

        return operations.getUserMe.handler({}, {}, {}, {
          _id: fooId
        })
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(commandsMocks.stubs.user.getById).to.have.been.calledWith(fooId)
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

      test.it('should return true if provided user has "service-registerer" role and body user has "module" role', () => {
        test.expect(operations.addUser.auth({
          role: 'service-registerer'
        }, {}, {
          role: 'module'
        })).to.be.true()
      })

      test.it('should return false if provided user has "service-registerer" role and body user has a role different to module', () => {
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
      testRole('module')
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

      test.it('should set the response header with the user id', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then(() => {
            return test.expect(response.header).to.have.been.calledWith('location', '/api/users/foo-id')
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
