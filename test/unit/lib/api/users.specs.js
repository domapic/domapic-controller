
const test = require('narval')

const mocks = require('../../mocks')

const users = require('../../../../lib/api/users')
const definition = require('../../../../lib/api/users.json')

test.describe('users api', () => {
  test.describe('Operations instance', () => {
    let operations
    let commandsMocks
    let baseMocks
    let eventsMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      commandsMocks = new mocks.Commands()
      operations = users.Operations(baseMocks.stubs.service, commandsMocks.stubs)
      eventsMocks = new mocks.Events()
    })

    test.afterEach(() => {
      baseMocks.restore()
      commandsMocks.restore()
      eventsMocks.restore()
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

      test.it('should return true if provided user has "service-registerer" role and received role in query is "plugin"', () => {
        test.expect(operations.getUsers.auth({
          role: 'service-registerer'
        }, {
          query: {
            role: 'plugin'
          }
        }, {})).to.be.true()
      })

      test.it('should return true if provided user has "plugin" role and received role in query is "operator"', () => {
        test.expect(operations.getUsers.auth({
          role: 'plugin'
        }, {
          query: {
            role: 'operator'
          }
        }, {})).to.be.true()
      })

      const testServiceRegistererRole = function (role) {
        test.it(`should return false if provided user has "service-registerer" role and received role in query is "${role}"`, () => {
          test.expect(operations.getUsers.auth({
            role: 'service-registerer'
          }, {
            query: {
              role: role
            }
          }, {})).to.be.false()
        })
      }
      testServiceRegistererRole('service-registerer')
      testServiceRegistererRole('admin')
      testServiceRegistererRole('operator')

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
      testRole('service-registerer')
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
      test.beforeEach(() => {
        commandsMocks.stubs.user.getById.resolves({
          role: 'operator'
        })
      })

      test.it('should resolve if provided user has "admin" role', () => {
        return operations.getUser.auth({
          role: 'admin'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should resolve if provided user has "service-registerer" role and requested user has "module" role', () => {
        commandsMocks.stubs.user.getById.resolves({
          role: 'module'
        })
        return operations.getUser.auth({
          role: 'service-registerer'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should return true if provided user has "service-registerer" role and requested user has "plugin" role', () => {
        commandsMocks.stubs.user.getById.resolves({
          role: 'plugin'
        })
        return operations.getUser.auth({
          role: 'service-registerer'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should return true if provided user has "plugin" role and requested user is "operator"', () => {
        commandsMocks.stubs.user.getById.resolves({
          role: 'operator'
        })
        return operations.getUser.auth({
          role: 'plugin'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should resolve if provided user id is same than logged user', () => {
        return operations.getUser.auth({
          role: 'plugin',
          _id: 'foo-id'
        }, {
          path: {
            id: 'foo-id'
          }
        }, {}).then(() => {
          return test.expect(true).to.be.true()
        })
      })

      test.it('should reject the promise if provided user id is different than logged user', () => {
        return operations.getUser.auth({
          role: 'module',
          _id: 'foo-id'
        }, {
          path: {
            id: 'foo-different-id'
          }
        }, {}).then(() => {
          return test.assert.fail()
        }, error => {
          return test.expect(error).to.be.an.instanceOf(Error)
        })
      })

      const testRole = function (userRole, requestedRole) {
        test.it(`should reject if user has "${userRole}" role and requested user has "${requestedRole}" role`, () => {
          commandsMocks.stubs.user.getById.resolves({
            role: requestedRole
          })
          return operations.getUser.auth({
            role: userRole
          }, {
            path: {
              id: 'foo-id'
            }
          }, {}).then(() => {
            return test.assert.fail()
          }, error => {
            return test.expect(error).to.be.an.instanceOf(Error)
          })
        })
      }
      testRole('plugin', 'admin')
      testRole('plugin', 'module')
      testRole('plugin', 'plugin')
      testRole('plugin', 'service-registerer')
      testRole('operator', 'admin')
      testRole('operator', 'module')
      testRole('operator', 'plugin')
      testRole('operator', 'service-registerer')
      testRole('service-registerer', 'admin')
      testRole('service-registerer', 'operator')
      testRole('module', 'admin')
      testRole('module', 'operator')
      testRole('module', 'module')
      testRole('module', 'plugin')
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

      test.it('should return true if provided user has "service-registerer" role and body user has "plugin" role', () => {
        test.expect(operations.addUser.auth({
          role: 'service-registerer'
        }, {}, {
          role: 'plugin'
        })).to.be.true()
      })

      test.it('should return true if provided user has "plugin" role and received role in query is "operator"', () => {
        test.expect(operations.addUser.auth({
          role: 'plugin'
        }, {}, {
          role: 'operator'
        })).to.be.true()
      })

      const testRole = function (userRole, role) {
        test.it(`should reject if user has "${userRole}" role and body user has "${role}" role`, () => {
          test.expect(operations.addUser.auth({
            role: userRole
          }, {}, {
            role
          })).to.be.false()
        })
      }

      testRole('plugin', 'admin')
      testRole('plugin', 'module')
      testRole('plugin', 'plugin')
      testRole('plugin', 'service-registerer')
      testRole('operator', 'admin')
      testRole('operator', 'module')
      testRole('operator', 'plugin')
      testRole('operator', 'service-registerer')
      testRole('service-registerer', 'admin')
      testRole('service-registerer', 'operator')
      testRole('module', 'admin')
      testRole('module', 'operator')
      testRole('module', 'module')
      testRole('module', 'plugin')

      const testEmptyRole = function (role) {
        test.it(`should return false if provided user has "${role}" role`, () => {
          test.expect(operations.addUser.auth({
            role
          }, {}, {})).to.be.false()
        })
      }

      testEmptyRole('module')
      testEmptyRole('operator')
      testEmptyRole('plugin')
      testEmptyRole('service-registerer')
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

      test.it('should emit a plugin event', () => {
        return operations.addUser.handler({}, fooBody, response)
          .then(() => {
            return test.expect(eventsMocks.stubs.plugin).to.have.been.calledWith('user', 'create', fooUser)
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
