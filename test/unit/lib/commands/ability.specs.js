
const test = require('narval')

const mocks = require('../../mocks')

const ability = require('../../../../lib/commands/ability')

test.describe('ability commands', () => {
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

      commands = ability.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      utilMocks.restore()
    })

    test.describe('add method', () => {
      const fooUserData = {
        _id: 'foo-user-id'
      }
      const fooServiceData = {
        _id: 'foo-service-id'
      }
      const fooAbilityData = {
        name: 'foo-ability-name'
      }

      test.beforeEach(() => {
        modelsMocks.stubs.Service.findOne.resolves(fooServiceData)
      })

      test.it('should call to find service related to logged user', () => {
        return commands.add(fooUserData, fooAbilityData)
          .then(() => {
            return test.expect(modelsMocks.stubs.Service.findOne).to.have.been.calledWith({
              _user: fooUserData._id
            })
          })
      })

      test.it('should reject the promise if no related service is found', () => {
        modelsMocks.stubs.Service.findOne.resolves(null)
        return commands.add(fooUserData, fooAbilityData)
          .then(() => {
            return test.assert.fail()
          }, (err) => {
            return Promise.all([
              test.expect(err).to.be.an.instanceOf(Error),
              test.expect(baseMocks.stubs.service.errors.Conflict).to.have.been.called()
            ])
          })
      })

      test.it('should create and save an Ability model with the received data, adding the service and user data', () => {
        return commands.add(fooUserData, fooAbilityData)
          .then(() => {
            return Promise.all([
              test.expect(modelsMocks.stubs.Ability).to.have.been.calledWith({
                ...fooAbilityData,
                _user: fooUserData._id,
                _service: fooServiceData._id
              }),
              test.expect(modelsMocks.stubs.ability.save).to.have.been.called()
            ])
          })
      })

      test.it('should resolve the promise with the new ability', () => {
        return commands.add(fooUserData, fooAbilityData)
          .then(ability => {
            return test.expect(modelsMocks.stubs.ability).to.equal(ability)
          })
      })

      test.it('should call to transform the received error if saving ability fails', () => {
        let saveError = new Error('save error')
        modelsMocks.stubs.ability.save.rejects(saveError)
        utilMocks.stubs.transformValidationErrors.rejects(saveError)
        return commands.add(fooUserData, fooAbilityData)
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

    test.describe('getFiltered method', () => {
      const fooFilter = {
        _service: 'foo-id'
      }
      const fooAbilities = [{
        name: 'foo'
      }]

      test.it('should call to find abilities and return the result', () => {
        modelsMocks.stubs.Ability.find.resolves(fooAbilities)
        return commands.getFiltered(fooFilter)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooAbilities),
              test.expect(modelsMocks.stubs.Ability.find).to.have.been.calledWith(fooFilter)
            ])
          })
      })

      test.it('should call to find abilities with an empty filter if it is not provided', () => {
        modelsMocks.stubs.Ability.find.resolves(fooAbilities)
        return commands.getFiltered()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooAbilities),
              test.expect(modelsMocks.stubs.Ability.find).to.have.been.calledWith({})
            ])
          })
      })
    })

    test.describe('get method', () => {
      test.it('should call to ability model findOne method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Ability.findOne.resolves(fooResult)
        return commands.get({_id: 'id'})
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Ability.findOne).to.have.been.called()
            ])
          })
      })

      test.it('should call to ability model get method with an empty object if it is not provided, and return the result', () => {
        const fooResult = []
        modelsMocks.stubs.Ability.findOne.resolves(fooResult)
        return commands.get()
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Ability.findOne.getCall(0).args[0]).to.deep.equal({})
            ])
          })
      })

      test.it('should return a not found error if no ability is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findOne.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.get({
          _id: 'foo'
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('getById method', () => {
      test.it('should call to ability model findById method, and return the result', () => {
        const fooId = 'foo-id'
        const fooResult = 'foo'
        modelsMocks.stubs.Ability.findById.resolves(fooResult)
        return commands.getById(fooId)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Ability.findById).to.have.been.calledWith(fooId)
            ])
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.rejects(new Error())
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
      const fooData = {description: 'foo-description'}

      test.it('should call to ability model findOneAndUpdate method, and return the result', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Ability.findOneAndUpdate.resolves(fooResult)
        return commands.update(fooId, fooData)
          .then((result) => {
            return Promise.all([
              test.expect(result).to.equal(fooResult),
              test.expect(modelsMocks.stubs.Ability.findOneAndUpdate).to.have.been.calledWith({
                _id: fooId
              }, fooData)
            ])
          })
      })

      test.it('should call to transform the received error if updating ability fails', () => {
        let updateError = new Error('update error')
        modelsMocks.stubs.Ability.findOneAndUpdate.rejects(updateError)
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

      test.it('should return a not found error if no ability is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findOneAndUpdate.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.update(fooId, fooData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })
  })
})
