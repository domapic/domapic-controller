
const test = require('narval')

const utils = require('./utils')

test.describe('abilities api', function () {
  let authenticator = utils.Authenticator()
  let pluginId
  let entityId

  const addService = function (serviceData) {
    return utils.request('/services', {
      method: 'POST',
      body: serviceData,
      ...authenticator.credentials()
    })
  }

  const getAbilities = function (filters) {
    return utils.request('/abilities', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const getAbility = function (abilityId) {
    return utils.request(`/abilities/${abilityId}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const updateAbility = function (abilityId, abilityData) {
    return utils.request(`/abilities/${abilityId}`, {
      method: 'PATCH',
      body: abilityData,
      ...authenticator.credentials()
    })
  }

  const addAbility = function (abilityData) {
    return utils.request('/abilities', {
      method: 'POST',
      body: abilityData,
      ...authenticator.credentials()
    })
  }

  const deleteAbility = function (abilityId) {
    return utils.request(`/abilities/${abilityId}`, {
      method: 'DELETE',
      ...authenticator.credentials()
    })
  }

  const adminUser = {
    name: 'foo-admin-2',
    role: 'admin',
    email: 'admin2@admin2.com',
    password: 'foo'
  }

  const operatorUser = {
    name: 'foo-operator',
    role: 'operator',
    email: 'operator@foo.com',
    password: 'foo'
  }

  const moduleUser = {
    name: 'foo-module-user',
    role: 'module'
  }

  const moduleUser2 = {
    name: 'foo-module-user-2',
    role: 'module'
  }

  const pluginUser = {
    name: 'foo-plugin',
    role: 'plugin',
    email: 'plugin@foo.com',
    password: 'foo'
  }

  const serviceRegistererUser = {
    name: 'foo-service-registerer',
    role: 'service-registerer',
    email: 'service-registerer-2@foo.com',
    password: 'foo'
  }

  const fooService = {
    processId: 'foo-service-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.1',
    type: 'module'
  }

  const fooAbility = {
    name: 'foo-ability-name',
    description: 'foo-description',
    action: true,
    event: true,
    state: true,
    format: 'email',
    type: 'boolean',
    actionDescription: 'foo action description',
    eventDescription: 'foo event description',
    stateDescription: 'foo state description'
  }

  test.before(() => {
    return utils.addPlugin()
      .then(id => {
        pluginId = id
      }).then(() => {
        return utils.doLogin(authenticator)
      })
  })

  test.describe('add ability', () => {
    test.describe('when user has module role', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data error if no name is provided', () => {
        const ability = {...fooAbility}
        delete ability.name
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "name"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a not valid name is provided', () => {
        const ability = {
          ...fooAbility,
          name: 'Foo-$"·$Wrong-name'
        }
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('does not match pattern'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no type is provided', () => {
        const ability = {...fooAbility}
        delete ability.type
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "type"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if an unvalid type is provided', () => {
        const ability = {...fooAbility}
        ability.type = 'invalid-type'
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('is not one of enum values'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if an unvalid format is provided', () => {
        const ability = {...fooAbility}
        ability.format = 'invalid-format'
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('is not one of enum values'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a conflict error if no service related to the user is found', () => {
        const ability = {...fooAbility}
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('User has not a related service'),
            test.expect(response.statusCode).to.equal(409)
          ])
        })
      })

      test.it('should return a conflict error if no service related to the user is found', () => {
        const ability = {...fooAbility}
        return addAbility(ability).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('User has not a related service'),
            test.expect(response.statusCode).to.equal(409)
          ])
        })
      })

      test.describe('when user has a related service', () => {
        test.before(() => {
          return addService(fooService).then((response) => {
            return Promise.resolve()
          })
        })

        test.it('should add ability to database if all provided data pass validation', () => {
          return addAbility(fooAbility).then((addResponse) => {
            const abilityId = addResponse.headers.location.split('/').pop()
            return getAbility(abilityId)
              .then((getResponse) => {
                const ability = getResponse.body
                entityId = ability._id
                return Promise.all([
                  test.expect(ability._id).to.equal(abilityId),
                  test.expect(ability.description).to.equal(fooAbility.description),
                  test.expect(ability.event).to.equal(fooAbility.event),
                  test.expect(ability.state).to.equal(fooAbility.state),
                  test.expect(ability.format).to.equal(fooAbility.format),
                  test.expect(ability.type).to.equal(fooAbility.type),
                  test.expect(ability.stateDescription).to.equal(fooAbility.stateDescription),
                  test.expect(ability.eventDescription).to.equal(fooAbility.eventDescription),
                  test.expect(ability.actionDescription).to.equal(fooAbility.actionDescription),
                  test.expect(ability.createdAt).to.not.be.undefined(),
                  test.expect(ability.updatedAt).to.not.be.undefined()
                ])
              })
          })
        })

        test.it('should have sent ability creation event to registered plugins', () => {
          return utils.expectEvent('ability:create', entityId, pluginId)
        })
      })
    })
  })

  test.describe('update ability', () => {
    let moduleUserAbility

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, moduleUser)
        .then(() => {
          return getAbilities()
            .then(getResponse => {
              moduleUserAbility = getResponse.body.find(ability => ability.name === fooAbility.name)
              return Promise.resolve()
            })
        })
    })

    test.describe('when ability do not belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
      })

      test.it('should return a forbidden error', () => {
        return updateAbility(moduleUserAbility._id, {
          description: 'foo-description'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should return a forbidden response when ability does not exist', () => {
        return updateAbility('foo-unexistant-ability-id', {
          description: 'foo-description'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
      })
    })

    test.describe('when ability belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data response if trying to update name', () => {
        return updateAbility(moduleUserAbility._id, {
          name: 'foo-new-name'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "name" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should update all provided ability data if pass validation', () => {
        const fooNewDescription = 'foo-new-ability-description'
        const fooNewActionDescription = 'foo-new-ability-action-description'
        const fooNewStateDescription = 'foo-new-ability-state-description'
        const fooNewEventDescription = 'foo-new-ability-event-description'
        return updateAbility(moduleUserAbility._id, {
          description: fooNewDescription,
          actionDescription: fooNewActionDescription,
          eventDescription: fooNewEventDescription,
          stateDescription: fooNewStateDescription
        })
          .then((patchResponse) => {
            return getAbility(moduleUserAbility._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(fooAbility.name),
                  test.expect(data.description).to.equal(fooNewDescription),
                  test.expect(data.actionDescription).to.equal(fooNewActionDescription),
                  test.expect(data.stateDescription).to.equal(fooNewStateDescription),
                  test.expect(data.eventDescription).to.equal(fooNewEventDescription),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })

      test.it('should have sent ability update event to registered plugins', () => {
        return utils.expectEvent('ability:update', moduleUserAbility._id, pluginId)
      })
    })
  })

  test.describe('delete ability', () => {
    let moduleUserAbility
    const abilityToRemove = {
      ...fooAbility,
      name: 'foo-ability-to-remove'
    }

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, moduleUser)
        .then(() => {
          return addAbility(abilityToRemove)
            .then(() => {
              return getAbilities()
                .then(getResponse => {
                  moduleUserAbility = getResponse.body.find(ability => ability.name === abilityToRemove.name)
                  return Promise.resolve()
                })
            })
        })
    })

    test.describe('when ability do not belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
      })

      test.it('should return a forbidden error', () => {
        return deleteAbility(moduleUserAbility._id)
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
      })

      test.it('should return a forbidden response when ability does not exist', () => {
        return deleteAbility('foo-unexistant-ability-id')
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
      })
    })

    test.describe('when ability belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should delete provided ability', () => {
        return deleteAbility(moduleUserAbility._id)
          .then((response) => {
            return getAbility(moduleUserAbility._id)
              .then((getResponse) => {
                return Promise.all([
                  test.expect(response.statusCode).to.equal(204),
                  test.expect(getResponse.statusCode).to.equal(404)
                ])
              })
          })
      })

      test.it('should have sent ability delete event to registered plugins', () => {
        return utils.expectEvent('ability:delete', moduleUserAbility._id, pluginId)
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let moduleUserAbility
      const fooNewAbility = {
        ...fooAbility,
        action: false
      }
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user).then(() => {
          return getAbilities()
            .then(getResponse => {
              moduleUserAbility = getResponse.body.find(ability => ability.name === fooAbility.name)
              return Promise.resolve()
            })
        })
      })

      test.describe('add ability', () => {
        test.it('should return a forbidden error', () => {
          return addAbility(fooNewAbility).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('get abilities', () => {
        test.it('should return all existant abilities', () => {
          return getAbilities()
            .then((getResponse) => {
              const ability1 = getResponse.body.find(ability => ability.name === fooAbility.name)
              return Promise.all([
                test.expect(ability1.event).to.equal(ability1.event)
              ])
            })
        })
      })

      test.describe('get ability', () => {
        test.it('should return ability data', () => {
          return getAbility(moduleUserAbility._id)
            .then((response) => {
              const ability = response.body
              return Promise.all([
                test.expect(ability._id).to.not.be.undefined(),
                test.expect(ability.name).to.equal(fooAbility.name),
                test.expect(ability.event).to.equal(fooAbility.event)
              ])
            })
        })

        test.it('should return a not found response when ability does not exist', () => {
          return getAbility('foo-unexistant-user-id')
            .then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.equal('Ability not found'),
                test.expect(response.statusCode).to.equal(404)
              ])
            })
        })
      })

      test.describe('update ability', () => {
        test.it('should return a forbidden error', () => {
          return updateAbility(moduleUserAbility._id, {
            description: 'foo-new-description'
          }).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('delete ability', () => {
        test.it('should return a forbidden error', () => {
          return deleteAbility(moduleUserAbility._id)
            .then(response => {
              return Promise.all([
                test.expect(response.body.message).to.contain('Not authorized'),
                test.expect(response.statusCode).to.equal(403)
              ])
            })
        })
      })
    })
  }

  testRole(adminUser)
  testRole(operatorUser)
  testRole(pluginUser)
  testRole(serviceRegistererUser)
})
