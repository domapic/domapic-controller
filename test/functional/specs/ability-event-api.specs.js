
const test = require('narval')

const utils = require('./utils')

test.describe('ability event api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let abilityId
  let moduleId

  const addModule = function (moduleData) {
    return utils.request('/modules', {
      method: 'POST',
      body: moduleData,
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

  const moduleUser = {
    name: 'foo-module-user',
    role: 'module'
  }

  const fooModule = {
    processId: 'foo-module-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.1'
  }

  const fooAbility = {
    name: 'foo-ability-name',
    description: 'foo-description',
    action: true,
    event: true,
    state: false,
    format: 'email',
    type: 'string',
    actionDescription: 'foo action description',
    eventDescription: 'foo event description'
  }

  test.before(() => {
    return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      .then(() => addModule(fooModule)
        .then((response) => {
          moduleId = response.headers.location.split('/').pop()
          return addAbility(fooAbility).then((addResponse) => {
            abilityId = addResponse.headers.location.split('/').pop()
            return Promise.resolve()
          })
        }))
  })

  test.describe('ability event api', () => {
    test.it('should return a forbidden error if ability id is unknown', () => {
      return utils.request(`/abilities/foo-ability-id/event`, {
        method: 'POST',
        body: {
          data: 'foo@foo.com'
        },
        ...authenticator.credentials()
      }).then(response => {
        return test.expect(response.statusCode).to.equal(403)
      })
    })

    test.it('should return a not found error if ability has not a related event', () => {
      return addAbility({...fooAbility,
        name: 'foo-ability-no-event-name',
        event: false
      }).then(addResponse => {
        const noEventAbilityId = addResponse.headers.location.split('/').pop()
        return utils.request(`/abilities/${noEventAbilityId}/event`, {
          method: 'POST',
          body: {
            data: 'foo@foo.com'
          },
          ...authenticator.credentials()
        }).then(response => {
          return Promise.all([
            test.expect(addResponse.statusCode).to.equal(201),
            test.expect(response.statusCode).to.equal(404)
          ])
        })
      })
    })

    test.it('should return a bad data error if event data is not valid', () => {
      return utils.request(`/abilities/${abilityId}/event`, {
        method: 'POST',
        body: {
          data: 'foo'
        },
        ...authenticator.credentials()
      }).then(response => {
        return Promise.all([
          test.expect(response.statusCode).to.equal(422),
          test.expect(response.body.message).to.contain('instance does not conform to the "email" format')
        ])
      })
    })

    test.it('should save the received event into logs', () => {
      const fooData = 'foo1@foo1.com'
      return utils.request(`/abilities/${abilityId}/event`, {
        method: 'POST',
        body: {
          data: fooData
        },
        ...authenticator.credentials()
      }).then(response => {
        return utils.waitOnestimatedStartTime(500)
          .then(() => {
            return utils.request(`/logs`, {
              method: 'GET',
              ...authenticator.credentials()
            })
              .then(logsResponse => {
                const log = logsResponse.body.find(savedLog => savedLog.data === fooData)
                return Promise.all([
                  test.expect(log.type).to.equal('event'),
                  test.expect(log._ability).to.equal(abilityId)
                ])
              })
          })
      })
    })

    test.it('should trace the received event', () => {
      return utils.request(`/abilities/${abilityId}/event`, {
        method: 'POST',
        body: {
          data: 'foo@foo.com'
        },
        ...authenticator.credentials()
      }).then(response => {
        return utils.waitOnestimatedStartTime(500)
          .then(() => {
            return utils.readLogs()
              .then(controllerLogs => {
                return Promise.all([
                  test.expect(controllerLogs).to.contain(`Received event from module "${moduleId}", ability "${abilityId}". Data: "foo@foo.com"`)
                ])
              })
          })
      })
    })
  })
})