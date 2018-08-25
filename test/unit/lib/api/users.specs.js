
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

    test.describe('getUsers handler', () => {
      test.it('should return all users, calling to correspondant command', () => {
        const resolves = 'foo result'
        commandsMocks.stubs.user.getAll.resolves(resolves)

        return operations.getUsers.handler()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(result),
              test.expect(commandsMocks.stubs.user.getAll).to.have.been.called()
            ])
          })
      })
    })

    test.describe('addUser handler', () => {
      const fooUser = {
        _id: 'foo-id'
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
