
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

    test.describe('getFiltered method', () => {
      const fooFilter = {
        _role: 'foo-role'
      }
      const fooUsers = [{
        token: 'foo'
      }]

      test.it('should call to find users and return the result', () => {
        modelsMocks.stubs.User.find.resolves(fooUsers)
        return commands.getFiltered(fooFilter)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooUsers),
              test.expect(modelsMocks.stubs.User.find).to.have.been.calledWith(fooFilter)
            ])
          })
      })

      test.it('should call to find users with an empty filter if it is not provided', () => {
        modelsMocks.stubs.User.find.resolves(fooUsers)
        return commands.getFiltered()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooUsers),
              test.expect(modelsMocks.stubs.User.find).to.have.been.calledWith({})
            ])
          })
      })
    })

    test.describe('get method', () => {
      test.it('should call to user model get method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.User.findOne.resolves(fooResult)
        return commands.get({_id: 'id'})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.User.findOne).to.have.been.called()
            ])
          })
      })

      test.it('should call to user model get method with an empty object if it is not provided, and return the result', () => {
        const fooResult = []
        modelsMocks.stubs.User.findOne.resolves(fooResult)
        return commands.get()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.User.findOne.getCall(0).args[0]).to.deep.equal({})
            ])
          })
      })

      test.it('should return a not found error if no user is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.User.findOne.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.get({_id: 'id'})
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('getById method', () => {
      test.it('should call to user model findById method, and return the result', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.User.findById.resolves(fooResult)
        return commands.getById(fooId)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.User.findById).to.have.been.calledWith(fooId)
            ])
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.User.findById.rejects(new Error())
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.getById('foo-id')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('update method', () => {
      const fooId = 'foo-id'
      const fooData = {role: 'foo-role'}

      test.it('should call to user model findOneAndUpdate method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.User.findOneAndUpdate.resolves(fooResult)
        return commands.update(fooId, fooData)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.User.findOneAndUpdate).to.have.been.calledWith({
                _id: fooId
              }, fooData)
            ])
          })
      })

      test.it('should call to transform the received error if updating user fails', () => {
        let updateError = new Error('update error')
        modelsMocks.stubs.User.findOneAndUpdate.rejects(updateError)
        utilMocks.stubs.transformValidationErrors.rejects(updateError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return Promise.all([
              test.expect(err).to.equal(updateError),
              test.expect(utilMocks.stubs.transformValidationErrors).to.have.been.calledWith(updateError)
            ])
          })
      })

      test.it('should return a not found error if no user is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.User.findOneAndUpdate.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('remove method', () => {
      const fooFilter = {name: 'foo-name'}

      test.it('should call to findOneAndRemove method', () => {
        modelsMocks.stubs.User.findOneAndRemove.resolves(fooFilter)
        return commands.remove(fooFilter)
          .then(() => {
            return test.expect(modelsMocks.stubs.User.findOneAndRemove).to.have.been.calledWith(fooFilter)
          })
      })

      test.it('should call to findOneAndRemove method with an empty object if no filter is provided', () => {
        modelsMocks.stubs.User.findOneAndRemove.resolves({})
        return commands.remove()
          .then(() => {
            return test.expect(modelsMocks.stubs.User.findOneAndRemove.getCall(0).args[0]).to.deep.equal({})
          })
      })

      test.it('should return a not found error if no user is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.User.findOneAndRemove.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.remove(fooFilter)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('init method', () => {
      test.it('should call to add initial users if getAll method returns an empty array', () => {
        modelsMocks.stubs.User.find.resolves([])
        return commands.init()
          .then(() => {
            return test.expect(modelsMocks.stubs.user.save).to.have.been.calledThrice()
          })
      })

      test.it('should do nothing if getAll method returns users', () => {
        modelsMocks.stubs.User.find.resolves(['foo-user'])
        return commands.init()
          .then(() => {
            return test.expect(modelsMocks.stubs.user.save).to.not.have.been.called()
          })
      })
    })
  })
})
