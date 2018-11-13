
const test = require('narval')

const utils = require('./utils')

test.describe('ability state api', function () {
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
    role: 'module'
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
    action: false,
    event: false,
    state: true,
    type: 'boolean',
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

  test.it('should return a not found error if ability id is unknown', () => {
    return utils.request(`/abilities/foo-ability-id/state`, {
      method: 'GET',
      ...authenticator.credentials()
    }).then(response => {
      return test.expect(response.statusCode).to.equal(404)
    })
  })

  test.it('should return a not found error if ability has not a related state', () => {
    return addAbility({...fooAbility,
      name: 'foo-ability-no-state-name',
      state: false
    }).then(addResponse => {
      const noActionAbilityId = addResponse.headers.location.split('/').pop()
      return utils.request(`/abilities/${noActionAbilityId}/state`, {
        method: 'GET',
        ...authenticator.credentials()
      }).then(response => {
        return Promise.all([
          test.expect(addResponse.statusCode).to.equal(201),
          test.expect(response.statusCode).to.equal(404)
        ])
      })
    })
  })

  test.it('should make a request to the service state url', () => {
    return utils.request(`/abilities/${abilityId}/state`, {
      method: 'GET',
      ...authenticator.credentials()
    }).then(response => {
      return utils.readLogs()
        .then(controllerLogs => {
          return Promise.all([
            test.expect(controllerLogs).to.contain(`Sending request to get state from service "${serviceId}", ability "${abilityId}"`),
            test.expect(controllerLogs).to.contain(`Send Request GET | https://192.168.1.1/api/abilities/foo-ability-name/state`),
            test.expect(response.statusCode).to.equal(502),
            test.expect(response.body.message).to.equal('Service not available')
          ])
        })
    })
  })
})
