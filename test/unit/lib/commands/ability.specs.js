
const test = require('narval')
const jsonschema = require('jsonschema')

const mocks = require('../../mocks')

const ability = require('../../../../lib/commands/ability')

test.describe('ability commands', () => {
  test.describe('Commands instance', () => {
    let sandbox
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks
    let jsonSchemaValidatorStub

    test.beforeEach(() => {
      sandbox = test.sinon.createSandbox()
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()
      jsonSchemaValidatorStub = sandbox.stub().returns({
        errors: []
      })
      sandbox.stub(jsonschema, 'Validator').returns({
        validate: jsonSchemaValidatorStub
      })
      commands = ability.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
    })

    test.afterEach(() => {
      sandbox.restore()
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

    test.describe('remove method', () => {
      const fooId = 'foo-id'

      test.it('should call to ability model findOneAndRemove method', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Ability.findOneAndRemove.resolves(fooResult)
        return commands.remove(fooId)
          .then((result) => {
            return test.expect(modelsMocks.stubs.Ability.findOneAndRemove).to.have.been.calledWith({
              _id: fooId
            })
          })
      })

      test.it('should return a not found error if no ability is found', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findOneAndRemove.resolves(null)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.remove(fooId)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('validateAction method', () => {
      const fooId = 'foo-id'
      const fooAbility = {
        action: true,
        type: 'foo-type'
      }
      const fooActionData = {
        data: 'foo-data'
      }

      test.it('should call to ability model findById method', () => {
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateAction(fooId, fooActionData)
          .then((result) => {
            return test.expect(modelsMocks.stubs.Ability.findById).to.have.been.calledWith(fooId)
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.rejects(new Error())
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateAction('foo-id', fooActionData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should return a not found error if ability has not defined action', () => {
        const fooError = new Error('foo error')
        const fooAbilityNoAction = {
          action: false
        }
        modelsMocks.stubs.Ability.findById.resolves(fooAbilityNoAction)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateAction('foo-id', fooActionData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should reject with a BadData Error if ability has no type and data is provided', () => {
        const fooError = new Error('foo error')
        const fooAbilityNoType = {
          action: true
        }
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        modelsMocks.stubs.Ability.findById.resolves(fooAbilityNoType)
        return commands.validateAction('foo-id', {
          data: 'foo'
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should reject with a BadData Error if ability has type and not data is provided', () => {
        const fooError = new Error('foo error')
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateAction('foo-id', {
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should call to validate data against a schema created with ability data description fields', () => {
        const fooDataDescriptionFields = {
          type: 'foo-type',
          format: 'foo-format',
          enum: 'foo-enum',
          maxLength: 'foo-max-length',
          minLength: 'foo-min-length',
          pattern: 'foo-pattern',
          multipleOf: 'foo-multiple-of',
          minimum: 'minimum',
          maximum: 'maximum',
          exclusiveMaximum: 'foo-exclusive-maximum',
          exclusiveMinimum: 'foo-exclusive-minimum'
        }
        modelsMocks.stubs.Ability.findById.resolves({...fooAbility, ...fooDataDescriptionFields})
        return commands.validateAction(fooId, fooActionData)
          .then((result) => {
            return test.expect(jsonSchemaValidatorStub).to.have.been.calledWith('foo-data', fooDataDescriptionFields)
          })
      })

      test.it('should reject with a BadData Error containing the validation message if validation fails', () => {
        const fooValidationErrorMessages = [
          'foo validation error message 1',
          'foo validation error message 2'
        ]
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        jsonSchemaValidatorStub.returns({
          errors: fooValidationErrorMessages
        })
        return commands.validateAction('foo-id', fooActionData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(baseMocks.stubs.service.errors.BadData).to.have.been.calledWith(fooValidationErrorMessages.join('. ')),
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should resolve the promise with the ability', () => {
        const fooId = 'foo-id'
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateAction(fooId, fooActionData)
          .then(result => {
            return test.expect(result).to.equal(fooAbility)
          })
      })
    })

    test.describe('validateEvent method', () => {
      const fooId = 'foo-id'
      const fooAbility = {
        event: true,
        type: 'foo-type'
      }
      const fooEventData = {
        data: 'foo-data'
      }

      test.it('should call to ability model findById method', () => {
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateEvent(fooId, fooEventData)
          .then((result) => {
            return test.expect(modelsMocks.stubs.Ability.findById).to.have.been.calledWith(fooId)
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.rejects(new Error())
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateEvent('foo-id', fooEventData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should return a not found error if ability has not defined event', () => {
        const fooError = new Error('foo error')
        const fooAbilityNoAction = {
          event: false
        }
        modelsMocks.stubs.Ability.findById.resolves(fooAbilityNoAction)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateEvent('foo-id', fooEventData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should reject with a BadData Error if ability has no type and data is provided', () => {
        const fooError = new Error('foo error')
        const fooAbilityNoType = {
          event: true
        }
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        modelsMocks.stubs.Ability.findById.resolves(fooAbilityNoType)
        return commands.validateEvent('foo-id', {
          data: 'foo'
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should reject with a BadData Error if ability has type and not data is provided', () => {
        const fooError = new Error('foo error')
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateEvent('foo-id', {
        })
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should call to validate data against a schema created with ability data description fields', () => {
        const fooDataDescriptionFields = {
          type: 'foo-type',
          format: 'foo-format',
          enum: 'foo-enum',
          maxLength: 'foo-max-length',
          minLength: 'foo-min-length',
          pattern: 'foo-pattern',
          multipleOf: 'foo-multiple-of',
          minimum: 'minimum',
          maximum: 'maximum',
          exclusiveMaximum: 'foo-exclusive-maximum',
          exclusiveMinimum: 'foo-exclusive-minimum'
        }
        modelsMocks.stubs.Ability.findById.resolves({...fooAbility, ...fooDataDescriptionFields})
        return commands.validateEvent(fooId, fooEventData)
          .then((result) => {
            return test.expect(jsonSchemaValidatorStub).to.have.been.calledWith('foo-data', fooDataDescriptionFields)
          })
      })

      test.it('should reject with a BadData Error containing the validation message if validation fails', () => {
        const fooValidationErrorMessages = [
          'foo validation error message 1',
          'foo validation error message 2'
        ]
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        baseMocks.stubs.service.errors.BadData.returns(fooError)
        jsonSchemaValidatorStub.returns({
          errors: fooValidationErrorMessages
        })
        return commands.validateEvent('foo-id', fooEventData)
          .then(() => {
            return test.assert.fail()
          }, err => {
            return Promise.all([
              test.expect(baseMocks.stubs.service.errors.BadData).to.have.been.calledWith(fooValidationErrorMessages.join('. ')),
              test.expect(err).to.equal(fooError)
            ])
          })
      })

      test.it('should resolve the promise with the ability', () => {
        const fooId = 'foo-id'
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateEvent(fooId, fooEventData)
          .then(result => {
            return test.expect(result).to.equal(fooAbility)
          })
      })
    })

    test.describe('validateState method', () => {
      const fooId = 'foo-id'
      const fooAbility = {
        state: true
      }

      test.it('should call to ability model findById method', () => {
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateState(fooId)
          .then((result) => {
            return test.expect(modelsMocks.stubs.Ability.findById).to.have.been.calledWith(fooId)
          })
      })

      test.it('should return a not found error if findById method throws an error', () => {
        const fooError = new Error('foo error')
        modelsMocks.stubs.Ability.findById.rejects(new Error())
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateState('foo-id')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should return a not found error if ability has not defined state', () => {
        const fooError = new Error('foo error')
        const fooAbilityNoState = {
          state: false
        }
        modelsMocks.stubs.Ability.findById.resolves(fooAbilityNoState)
        baseMocks.stubs.service.errors.NotFound.returns(fooError)
        return commands.validateState('foo-id')
          .then(() => {
            return test.assert.fail()
          }, err => {
            return test.expect(err).to.equal(fooError)
          })
      })

      test.it('should resolve the promise with the ability', () => {
        const fooId = 'foo-id'
        modelsMocks.stubs.Ability.findById.resolves(fooAbility)
        return commands.validateState(fooId)
          .then(result => {
            return test.expect(result).to.equal(fooAbility)
          })
      })
    })

    test.describe('findAndRemove method', () => {
      const fooFilter = {
        _id: 'foo-id'
      }

      test.it('should call to ability model deleteMany method', () => {
        const fooResult = 'foo'
        modelsMocks.stubs.Ability.deleteMany.resolves(fooResult)
        return commands.findAndRemove(fooFilter)
          .then((result) => {
            return test.expect(modelsMocks.stubs.Ability.deleteMany).to.have.been.calledWith(fooFilter)
          })
      })
    })
  })
})
