
const test = require('narval')

const mocks = require('../../mocks')

const user = require('../../../../lib/commands/user')

test.describe('user commands', () => {
  test.describe('Commands instance', () => {
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()

      commands = user.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      utilMocks.restore()
    })

    test.describe('add method', () => {
      const fooUserData = {
        name: 'foo name'
      }
      test.it('should create and save an User model with the received data', () => {
        return commands.add(fooUserData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.User).to.have.been.calledWith(fooUserData),
              test.expect(modelsMocks.stubs.user.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new user', () => {
        return commands.add(fooUserData)
          .then((user) => {
            return test.expect(modelsMocks.stubs.user).to.equal(user)
          })
      })

      test.it('should call to transform the received error if saving user fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.user.save.rejects(saveError)
        utilMocks.stubs.transformValidationErrors.rejects(saveError)
        return commands.add(fooUserData)
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return Promise.all([
              test.expect(err).to.equal(saveError),
              test.expect(utilMocks.stubs.transformValidationErrors).to.have.been.calledWith(saveError)
            ])
          })
      })
    })

    test.describe('getAll method', () => {
      test.it('should call to user model find method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.User.find.resolves(fooResult)
        return commands.getAll()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.User.find).to.have.been.called()
            ])
          })
      })
    })
  })
})
