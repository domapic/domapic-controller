
const test = require('narval')
const randToken = require('rand-token')

const mocks = require('../../mocks')

const refreshToken = require('../../../../lib/commands/refreshToken')

test.describe('refreshToken commands', () => {
  test.describe('Commands instance', () => {
    const fooToken = 'foo-token'
    let sandbox
    let randTokenStub
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks

    test.beforeEach(() => {
      sandbox = test.sinon.createSandbox()
      randTokenStub = sandbox.stub(randToken, 'generate').returns(fooToken)
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()
      sandbox.stub()

      commands = refreshToken.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      utilMocks.restore()
      sandbox.restore()
    })

    test.describe('add method', () => {
      const fooUserId = 'foo-user-id'
      const fooUserData = {
        _id: fooUserId
      }
      test.it('should create and save a RefreshToken model with the received user data', () => {
        return commands.add(fooUserData)
          .then(() => {
            return Promise.all([
              test.expect(randTokenStub).to.have.been.called(),
              test.expect(modelsMocks.stubs.RefreshToken).to.have.been.calledWith({
                _user: fooUserId,
                token: 'foo-token'
              }),
              test.expect(modelsMocks.stubs.refreshToken.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new refreshToken', () => {
        return commands.add(fooUserData)
          .then(token => {
            return test.expect(modelsMocks.stubs.refreshToken).to.equal(token)
          })
      })

      test.it('should call to transform the received error if saving token fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.refreshToken.save.rejects(saveError)
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

    test.describe('getUser method', () => {
      test.it('should call to find refresh token, then find related user, and return the result', () => {
        const fooUserId = 'fooUserId'
        const fooToken = {
          _user: fooUserId
        }
        const fooUser = {
          _id: fooUserId
        }
        modelsMocks.stubs.RefreshToken.findOne.resolves(fooToken)
        modelsMocks.stubs.User.findById.resolves(fooUser)
        return commands.getUser('foo-token')
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooUser),
              test.expect(modelsMocks.stubs.RefreshToken.findOne).to.have.been.calledWith({
                token: 'foo-token'
              }),
              test.expect(modelsMocks.stubs.User.findById).to.have.been.calledWith(fooUserId)
            ])
          })
      })

      test.it('should return a not found error if no user is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.RefreshToken.findOne.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.getUser('foo-token')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('remove method', () => {
      test.it('should call to find user model refresh token, then find related user, and then remove token', () => {
        const fooUserId = 'fooUserId'
        const fooToken = {
          _user: fooUserId
        }
        const fooUser = {
          _id: fooUserId
        }
        modelsMocks.stubs.RefreshToken.findOne.resolves(fooToken)
        modelsMocks.stubs.User.findById.resolves(fooUser)
        return commands.remove('foo-token')
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.RefreshToken.findOne).to.have.been.calledWith({
                token: 'foo-token'
              }),
              test.expect(modelsMocks.stubs.User.findById).to.have.been.calledWith(fooUserId),
              test.expect(modelsMocks.stubs.RefreshToken.deleteOne).to.have.been.calledWith({
                token: 'foo-token'
              })
            ])
          })
      })

      test.it('should return a not found error if no user is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.RefreshToken.findOne.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.remove('foo-token')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })
  })
})
