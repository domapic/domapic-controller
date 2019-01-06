
const test = require('narval')

const utils = require('./utils')

test.describe('when authentication is disabled', function () {
  let moduleUserId
  let serviceId

  const getUsers = query => utils.request('/users', {
    method: 'GET',
    query
  })

  const createUser = body => utils.request(`/users`, {
    method: 'POST',
    body
  })

  const createService = body => utils.request(`/services`, {
    method: 'POST',
    body
  })

  const getServices = body => utils.request(`/services`, {
    method: 'GET'
  })

  const createAbility = body => utils.request(`/abilities`, {
    method: 'POST',
    body
  })

  const getAbilities = body => utils.request(`/abilities`, {
    method: 'GET'
  })

  const moduleUser = {
    name: 'foo-service',
    role: 'module'
  }

  const service = {
    processId: 'foo-process-id',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'foo-api-key',
    url: 'http://192.168.1.100:3500',
    type: 'module',
    name: 'foo-service'
  }

  const ability = {
    name: 'foo-ability-name'
  }

  test.describe('users api', () => {
    test.describe('create user', () => {
      test.it('should add user to database if all provided data pass validation', () => {
        return createUser(moduleUser).then(addResponse => {
          return getUsers()
            .then(getResponse => {
              moduleUserId = addResponse.headers.location.split('/').pop()
              const user = getResponse.body.find(user => user._id === moduleUserId)
              return Promise.all([
                test.expect(user.name).to.equal(moduleUser.name),
                test.expect(user.role).to.equal(moduleUser.role)
              ])
            })
        })
      })
    })

    test.describe('create service', () => {
      test.it('should add service to database, adding as _user the user with same name than service', () => {
        return createService(service).then(addResponse => {
          return getServices()
            .then(getResponse => {
              serviceId = addResponse.headers.location.split('/').pop()
              const newService = getResponse.body.find(service => service._id === serviceId)
              return Promise.all([
                test.expect(newService.name).to.equal(newService.name),
                test.expect(newService._user).to.equal(moduleUserId)
              ])
            })
        })
      })
    })

    test.describe('create ability', () => {
      test.it('should add ability to database, adding as _user the user owner of the service', () => {
        return createAbility({
          ...ability,
          _service: serviceId
        }).then(addResponse => {
          return getAbilities()
            .then(getResponse => {
              const abilityId = addResponse.headers.location.split('/').pop()
              const newAbility = getResponse.body.find(ability => ability._id === abilityId)
              return Promise.all([
                test.expect(newAbility.name).to.equal(ability.name),
                test.expect(newAbility._service).to.equal(serviceId),
                test.expect(newAbility._user).to.equal(moduleUserId)
              ])
            })
        })
      })
    })
  })
})
