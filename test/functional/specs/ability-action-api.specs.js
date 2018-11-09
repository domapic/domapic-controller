
const test = require('narval')

const utils = require('./utils')

test.describe('ability action api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let abilityId
  let serviceId

  const addService = function (serviceData) {
    return utils.request('/services', {
      method: 'POST',
      body: serviceData,
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

  const serviceUser = {
    name: 'foo-service-user',
    role: 'service'
  }

  const fooService = {
    processId: 'foo-service-id',
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
    event: false,
    state: false,
    format: 'email',
    type: 'string',
    actionDescription: 'foo action description'
  }

  test.before(() => {
    return utils.ensureUserAndDoLogin(authenticator, serviceUser)
      .then(() => addService(fooService)
        .then((response) => {
          serviceId = response.headers.location.split('/').pop()
          return addAbility(fooAbility).then((addResponse) => {
            abilityId = addResponse.headers.location.split('/').pop()
            return Promise.resolve()
          })
        }))
  })

  test.describe('ability action api', () => {
    test.it('should return a not found error if ability id is unknown', () => {
      return utils.request(`/abilities/foo-ability-id/action`, {
        method: 'POST',
        body: {
          data: 'foo@foo.com'
        },
        ...authenticator.credentials()
      }).then(response => {
        return test.expect(response.statusCode).to.equal(404)
      })
    })

    test.it('should return a not found error if ability has not a related action', () => {
      return addAbility({...fooAbility,
        name: 'foo-ability-no-action-name',
        action: false
      }).then(addResponse => {
        const noActionAbilityId = addResponse.headers.location.split('/').pop()
        return utils.request(`/abilities/${noActionAbilityId}/action`, {
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

    test.it('should return a bad data error if action data is not valid', () => {
      return utils.request(`/abilities/${abilityId}/action`, {
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

    test.it('should make a request to the service action url', () => {
      return utils.request(`/abilities/${abilityId}/action`, {
        method: 'POST',
        body: {
          data: 'foo@foo.com'
        },
        ...authenticator.credentials()
      }).then(response => {
        return utils.readLogs()
          .then(controllerLogs => {
            return Promise.all([
              test.expect(controllerLogs).to.contain(`Sending action to service "${serviceId}", ability "${abilityId}". Data: "foo@foo.com"`),
              test.expect(controllerLogs).to.contain(`Send Request POST | https://192.168.1.1/api/abilities/foo-ability-name/action`),
              test.expect(response.statusCode).to.equal(502),
              test.expect(response.body.message).to.equal('Service not available')
            ])
          })
      })
    })
  })
})
