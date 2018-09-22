
const test = require('narval')
const testUtils = require('narval/utils')

const utils = require('./utils')

test.describe('services api', function () {
  let authenticator = utils.Authenticator()

  const getServices = function (filters) {
    return utils.request('/services', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const getService = function (serviceId) {
    return utils.request(`/services/${serviceId}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const updateService = function (serviceId, serviceData) {
    return utils.request(`/services/${serviceId}`, {
      method: 'PATCH',
      body: serviceData,
      ...authenticator.credentials()
    })
  }

  const getUser = function (userName) {
    return utils.request(`/users/${userName}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const addService = function (serviceData) {
    return utils.request('/services', {
      method: 'POST',
      body: serviceData,
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

  const serviceUser = {
    name: 'foo-service-user',
    role: 'service'
  }

  const serviceUser2 = {
    name: 'foo-service-user-2',
    role: 'service'
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
    id: 'foo-service-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.1'
  }

  const fooUpdatedService = {
    description: 'foo updated description',
    package: 'foo updated package',
    version: 'foo updated version',
    apiKey: 'foo updated api key',
    url: 'https://2.2.2.2'
  }

  const fooService2 = {
    ...fooService,
    url: 'https://192.168.1.2'
  }

  test.before(() => {
    return utils.doLogin(authenticator)
  })

  test.describe('add service', () => {
    test.describe('when user has service role', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, serviceUser)
      })

      test.it('should return a bad data error if no id is provided', () => {
        const service = {...fooService}
        delete service.id
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "id"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no package is provided', () => {
        const service = {...fooService}
        delete service.package
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "package"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no version is provided', () => {
        const service = {...fooService}
        delete service.version
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "version"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no apiKey is provided', () => {
        const service = {...fooService}
        delete service.apiKey
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "apiKey"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no url is provided', () => {
        const service = {...fooService}
        delete service.url
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "url"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a not valid url is provided', () => {
        const service = {...fooService}
        service.url = 'foo-bad-url'
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('does not conform to the "uri" format'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should add service to database if all provided data pass validation', () => {
        return getUser(serviceUser.name)
          .then((getUserResponse) => {
            const userId = getUserResponse.body._id
            return addService(fooService).then((addResponse) => {
              const serviceId = addResponse.headers.location.split('/').pop()
              return getService(serviceId)
                .then((getResponse) => {
                  const service = getResponse.body
                  return Promise.all([
                    test.expect(service.name).to.equal(serviceUser.name),
                    test.expect(service.package).to.equal(fooService.package),
                    test.expect(service.version).to.equal(fooService.version),
                    test.expect(service._user).to.equal(userId),
                    test.expect(service.url).to.equal(fooService.url),
                    test.expect(service.apiKey).to.be.undefined(),
                    test.expect(service.id).to.equal(fooService.id),
                    test.expect(service.createdAt).to.not.be.undefined(),
                    test.expect(service.updatedAt).to.not.be.undefined()
                  ])
                })
            })
          })
      })

      test.it('should return a bad data error if one user tries to add more than one service', () => {
        return addService(fooService).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('name: Service name already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if repeated url is provided', () => {
        return utils.ensureUserAndDoLogin(authenticator, serviceUser2)
          .then(() => {
            return addService(fooService).then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.contain('url: Service url already exists'),
                test.expect(response.statusCode).to.equal(422)
              ])
            })
          })
      })
    })
  })

  test.describe('update service', () => {
    let serviceUserService

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, serviceUser)
        .then(() => {
          return getServices()
            .then(getResponse => {
              serviceUserService = getResponse.body.find(service => service.name === serviceUser.name)
              return Promise.resolve()
            })
        })
    })

    test.describe('when service do not belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, serviceUser2)
      })

      test.it('should return a forbidden error', () => {
        return updateService(serviceUserService._id, {
          description: 'foo-description'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should return a forbidden response when service does not exist', () => {
        return updateService('foo-unexistant-service-id', {
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

    test.describe('when service belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, serviceUser)
      })

      test.it('should return a bad data response if trying to update name', () => {
        return updateService(serviceUserService._id, {
          name: 'foo-new-name'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "name" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if trying to update id', () => {
        return updateService(serviceUserService._id, {
          id: 'foo-new-id'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "id" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if trying to update _user', () => {
        return updateService(serviceUserService._id, {
          _user: 'foo-new-user-id'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "_user" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if wrong url is provided', () => {
        return updateService(serviceUserService._id, {
          url: 'foo'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('does not conform to the "uri" format'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if repeated url is provided', () => {
        return updateService(serviceUserService._id, {
          url: fooService.url
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('url: Service url already exists'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should update all provided service data', () => {
        return updateService(serviceUserService._id, fooUpdatedService)
          .then((patchResponse) => {
            return getService(serviceUserService._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(serviceUser.name),
                  test.expect(data.id).to.equal(fooService.id),
                  test.expect(data.description).to.equal(fooUpdatedService.description),
                  test.expect(data.package).to.equal(fooUpdatedService.package),
                  test.expect(data.version).to.equal(fooUpdatedService.version),
                  test.expect(data.apiKey).to.be.undefined(),
                  test.expect(data.url).to.equal(fooUpdatedService.url),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let serviceUserService
      const fooNewService = {
        ...fooService,
        url: `https://${user.role}.com`
      }
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user).then(() => {
          return getServices()
            .then(getResponse => {
              serviceUserService = getResponse.body.find(service => service.name === serviceUser.name)
              return Promise.resolve()
            })
        })
      })

      test.describe('add service', () => {
        test.it('should return a forbidden error', () => {
          return addService(fooNewService).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('get services', () => {
        test.it('should return all existant services', () => {
          return getServices()
            .then((getResponse) => {
              const service1 = getResponse.body.find(service => service.name === serviceUser.name)
              return Promise.all([
                test.expect(service1.url).to.equal(fooUpdatedService.url)
              ])
            })
        })
      })

      test.describe('get service', () => {
        test.it('should return service data', () => {
          return getService(serviceUserService._id)
            .then((response) => {
              const service = response.body
              return Promise.all([
                test.expect(service._id).to.not.be.undefined(),
                test.expect(service.name).to.equal(serviceUser.name),
                test.expect(service.url).to.equal(fooUpdatedService.url)
              ])
            })
        })

        test.it('should return a not found response when service does not exist', () => {
          return getService('foo-unexistant-user-id')
            .then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.equal('Service not found'),
                test.expect(response.statusCode).to.equal(404)
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
