
const test = require('narval')

const utils = require('./utils')

test.describe('services api', function () {
  let authenticator = utils.Authenticator()
  let pluginId
  let entityId

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

  const fooService2 = {
    processId: 'foo-service-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsasdfds',
    url: 'https://192.168.1.42',
    type: 'plugin'
  }

  const fooUpdatedService = {
    description: 'foo updated description',
    package: 'foo updated package',
    version: 'foo updated version',
    apiKey: 'foo updated api key',
    url: 'https://2.2.2.2'
  }

  const fooUpdatedServiceRepeatedUrl = {
    description: 'foo updated description 2',
    package: 'foo updated package 2',
    version: 'foo updated version 2',
    apiKey: 'foo updated api key 2',
    url: 'https://2.2.2.2'
  }

  test.before(() => {
    return utils.addPlugin()
      .then(id => {
        pluginId = id
      })
      .then(() => utils.doLogin(authenticator))
  })

  test.describe('add service', () => {
    test.describe('when user has module role', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data error if no processId is provided', () => {
        const service = {...fooService}
        delete service.processId
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "processId"'),
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
        return addService(fooService).then((addResponse) => {
          const serviceId = addResponse.headers.location.split('/').pop()
          entityId = serviceId
          return getService(serviceId)
            .then((getResponse) => {
              const service = getResponse.body
              return Promise.all([
                test.expect(service.name).to.equal(moduleUser.name),
                test.expect(service.package).to.equal(fooService.package),
                test.expect(service.version).to.equal(fooService.version),
                test.expect(service.url).to.equal(fooService.url),
                test.expect(service.apiKey).to.be.undefined(),
                test.expect(service.processId).to.equal(fooService.processId),
                test.expect(service.type).to.equal(fooService.type),
                test.expect(service.createdAt).to.not.be.undefined(),
                test.expect(service.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should have sent service creation event to registered plugins', () => {
        return utils.expectEvent('service:create', entityId, pluginId)
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
        return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
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

  test.describe('get services', () => {
    test.it('should return all services', () => {
      return getServices()
        .then(getResponse => {
          return Promise.all([
            test.expect(getResponse.statusCode).to.equal(200),
            test.expect(getResponse.body.length).to.equal(2)
          ])
        })
    })

    test.it('should return plugin services when filtering by plugin type', () => {
      return getServices({
        type: 'plugin'
      })
        .then(getResponse => {
          const service = getResponse.body.find(service => service.type !== 'plugin')
          return Promise.all([
            test.expect(getResponse.statusCode).to.equal(200),
            test.expect(service).to.be.undefined(),
            test.expect(getResponse.body.length).to.equal(1)
          ])
        })
    })

    test.it('should return module services when filtering by module type', () => {
      return getServices({
        type: 'module'
      })
        .then(getResponse => {
          const service = getResponse.body.find(service => service.type !== 'module')
          return Promise.all([
            test.expect(getResponse.statusCode).to.equal(200),
            test.expect(service).to.be.undefined(),
            test.expect(getResponse.body.length).to.equal(1)
          ])
        })
    })
  })

  test.describe('update service', () => {
    let moduleUserService

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, pluginUser)
        .then(() => {
          return addService(fooService2).then(res => {
            if (res.statusCode !== 201) {
              return Promise.reject(new Error())
            }
            return utils.ensureUserAndDoLogin(authenticator, moduleUser)
              .then(() => {
                return getServices()
                  .then(getResponse => {
                    moduleUserService = getResponse.body.find(service => service.name === moduleUser.name)
                    return Promise.resolve()
                  })
              })
          })
        })
    })

    test.describe('when service do not belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, pluginUser)
      })

      test.it('should return a forbidden error', () => {
        return updateService(moduleUserService._id, {
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
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data response if trying to update name', () => {
        return updateService(moduleUserService._id, {
          name: 'foo-new-name'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "name" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if trying to update processId', () => {
        return updateService(moduleUserService._id, {
          processId: 'foo-new-processId'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('additionalProperty "processId" exists in instance when not allowed'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should return a bad data response if trying to update _user', () => {
        return updateService(moduleUserService._id, {
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
        return updateService(moduleUserService._id, {
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
        return updateService(moduleUserService._id, {
          url: fooService2.url
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('url: Service url already exists'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should update all provided service data', () => {
        return updateService(moduleUserService._id, fooUpdatedService)
          .then((patchResponse) => {
            return getService(moduleUserService._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(moduleUser.name),
                  test.expect(data.processId).to.equal(fooService.processId),
                  test.expect(data.type).to.equal(fooService.type),
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

      test.it('should have sent service update event to registered plugins', () => {
        return utils.expectEvent('service:update', moduleUserService._id, pluginId)
      })

      test.it('should update all provided service data even when url is same than before', () => {
        return updateService(moduleUserService._id, fooUpdatedServiceRepeatedUrl)
          .then((patchResponse) => {
            return getService(moduleUserService._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(moduleUser.name),
                  test.expect(data.processId).to.equal(fooService.processId),
                  test.expect(data.type).to.equal(fooService.type),
                  test.expect(data.description).to.equal(fooUpdatedServiceRepeatedUrl.description),
                  test.expect(data.package).to.equal(fooUpdatedServiceRepeatedUrl.package),
                  test.expect(data.version).to.equal(fooUpdatedServiceRepeatedUrl.version),
                  test.expect(data.apiKey).to.be.undefined(),
                  test.expect(data.url).to.equal(fooUpdatedServiceRepeatedUrl.url),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let moduleUserService
      const fooNewService = {
        ...fooService,
        url: `https://${user.role}.com`
      }
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user).then(() => {
          return getServices()
            .then(getResponse => {
              moduleUserService = getResponse.body.find(service => service.name === moduleUser.name)
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
              const service1 = getResponse.body.find(service => service.name === moduleUser.name)
              return Promise.all([
                test.expect(service1.url).to.equal(fooUpdatedService.url)
              ])
            })
        })
      })

      test.describe('get service', () => {
        test.it('should return service data', () => {
          return getService(moduleUserService._id)
            .then((response) => {
              const service = response.body
              return Promise.all([
                test.expect(service._id).to.not.be.undefined(),
                test.expect(service.name).to.equal(moduleUser.name),
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
  testRole(serviceRegistererUser)
})
