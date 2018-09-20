
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

  const getService = function (serviceName) {
    return utils.request(`/services/${serviceName}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const updateService = function (serviceName, serviceData) {
    return utils.request(`/services/${serviceName}`, {
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

  const operatorUser = {
    name: 'foo-operator',
    role: 'operator',
    email: 'operator@foo.com',
    password: 'foo'
  }

  const serviceUser = {
    name: 'foo-service-user',
    role: 'service',
    email: 'service@foo.com',
    password: 'foo'
  }

  const pluginUser = {
    name: 'foo-plugin',
    role: 'plugin',
    email: 'plugin@foo.com',
    password: 'foo'
  }

  const fooService = {
    name: 'foo-service-name',
    id: 'foo-service-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    _user: 'foo-user-id',
    url: 'https://192.168.1.1'
  }

  const fooService2 = {
    ...fooService,
    name: 'foo-service-name-2',
    url: 'https://192.168.1.2'
  }

  test.before(() => {
    return utils.doLogin(authenticator)
  })

  test.describe('when user has permissions', () => {
    test.describe('add service', () => {
      test.it('should return a bad data error if no name is provided', () => {
        const service = {...fooService}
        delete service.name
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "name"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a not valid name is provided', () => {
        const service = {...fooService}
        service.name = 'Foo-$"·$Wrong-name'
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('does not match pattern'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
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

      test.it('should return a bad data error if no _user is provided', () => {
        const service = {...fooService}
        delete service._user
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "_user"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should add service to database if all provided data pass validation', () => {
        return addService(fooService).then((addResponse) => {
          return getServices()
            .then((getResponse) => {
              const serviceName = addResponse.headers.location.split('/').pop()
              const service = getResponse.body.find(service => service.name === serviceName)
              return Promise.all([
                test.expect(service.name).to.equal(fooService.name),
                test.expect(service.package).to.equal(fooService.package),
                test.expect(service.version).to.equal(fooService.version),
                test.expect(service._user).to.equal(fooService._user),
                test.expect(service.url).to.equal(fooService.url),
                test.expect(service.apiKey).to.be.undefined(),
                test.expect(service.id).to.equal(fooService.id),
                test.expect(service.createdAt).to.not.be.undefined(),
                test.expect(service.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should return a bad data error if repeated name is provided', () => {
        const service = {...fooService}
        service.url = 'https://localhost:4321'
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('name: Service name already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if repeated url is provided', () => {
        const service = {...fooService}
        service.name = 'another-foo-name'
        return addService(service).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('url: Service url already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })
    })

    test.describe('get services', () => {
      test.it('should return all existant services', () => {
        return addService(fooService2).then(() => {
          return getServices()
            .then((getResponse) => {
              const service1 = getResponse.body.find(service => service.name === fooService.name)
              const service2 = getResponse.body.find(service => service.name === fooService2.name)
              return Promise.all([
                test.expect(service1.name).to.equal(fooService.name),
                test.expect(service2.name).to.equal(fooService2.name),
                test.expect(service1.url).to.equal(fooService.url),
                test.expect(service2.url).to.equal(fooService2.url)
              ])
            })
        })
      })
    })

    test.describe('get service', () => {
      test.it('should return service data', () => {
        return getService(fooService.name)
          .then((response) => {
            const service = response.body
            return Promise.all([
              test.expect(service._id).to.not.be.undefined(),
              test.expect(service.name).to.equal(fooService.name),
              test.expect(service.url).to.equal(fooService.url)
            ])
          })
      })

      test.it('should return a not found response when service does not exist', () => {
        return getService('foo-unexistant-user')
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.equal('Service not found'),
              test.expect(response.statusCode).to.equal(404)
            ])
          })
      })
    })

    test.describe('update service', () => {
      test.it('should return a not found response when service does not exist', () => {
        return updateService('foo-unexistant-user', {
          description: 'foo-description'
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.equal('Service not found'),
              test.expect(response.statusCode).to.equal(404)
            ])
          })
      })

      test.it('should return a bad data response if trying to update name', () => {
        return updateService(fooService2, {
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
        return updateService(fooService2, {
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
        return updateService(fooService2, {
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
        return updateService(fooService2, {
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
        return updateService(fooService2, {
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
        const fooData = {
          description: 'foo updated description',
          package: 'foo updated package',
          version: 'foo updated version',
          apiKey: 'foo updated api key',
          url: 'https://2.2.2.2'
        }
        return updateService(fooService2.name, fooData)
          .then((patchResponse) => {
            return getService(fooService2.name)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(fooService2.name),
                  test.expect(data.id).to.equal(fooService2.id),
                  test.expect(data.description).to.equal(fooData.description),
                  test.expect(data.package).to.equal(fooData.package),
                  test.expect(data.version).to.equal(fooData.version),
                  test.expect(data.apiKey).to.be.undefined(),
                  test.expect(data.url).to.equal(fooData.url),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let userId
      let fooNewUserService
      const fooNewServiceName = `foo-${user.role}-service`
      const fooNewService = {
        ...fooService,
        name: fooNewServiceName,
        url: `https://${user.role}.com`
      }
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user).then(() => {
          return getUser(user.name).then((response) => {
            userId = response.body._id
            fooNewUserService = {
              ...fooNewService,
              _user: userId
            }
            return Promise.resolve()
          })
        })
      })

      test.describe('add service', () => {
        test.it('should return a forbidden error if provided _user is not himself', () => {
          return addService(fooNewService).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should add service if provided _user is himself', () => {
          return addService(fooNewUserService).then(response => {
            return test.expect(response.statusCode).to.equal(201)
          })
        })
      })

      test.describe('update service', () => {
        test.it('should return a forbidden error if provided _user is not himself', () => {
          return updateService(fooService.name, {
            description: 'foo new description'
          }).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should update service if provided _user is himself', () => {
          return updateService(fooNewUserService.name, {
            description: 'foo new description'
          }).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })

      test.describe('get services', () => {
        test.it('should return a forbidden error if no query is defined', () => {
          return getServices().then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return a forbidden error if query is defined but user id is not from himself', () => {
          return getServices({
            user: 'foo-user-id'
          }).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return services if user query is defined and belongs to himself', () => {
          return getServices({
            user: userId
          }).then(response => {
            return Promise.all([
              test.expect(response.body[0].name).to.equal(fooNewUserService.name),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })

      test.describe('get service', () => {
        test.it('should return a forbidden error if service user is different to himself', () => {
          return getService(fooService.name).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return user data if user is himself', () => {
          return getService(fooNewServiceName).then(response => {
            return Promise.all([
              test.expect(response.body.name).to.equal(fooNewUserService.name),
              test.expect(response.body.url).to.equal(fooNewUserService.url),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })
    })
  }

  testRole(operatorUser)
  testRole(serviceUser)
  testRole(pluginUser)

  test.describe('when user has role "service-registerer"', () => {
    const fooNewService = {
      ...fooService,
      name: `foo-service-registerer-service`,
      url: `https://service-registerer-service-url.com`
    }

    test.before(() => {
      return testUtils.logs.combined('controller')
        .then((log) => {
          authenticator.loginApiKey('service-registerer', /Use the next api key to register services: (\S*)\n/.exec(log)[1])
        })
    })

    test.describe('add service', () => {
      test.it('should add service', () => {
        return addService(fooNewService).then(response => {
          return test.expect(response.statusCode).to.equal(201)
        })
      })
    })

    test.describe('update service', () => {
      test.it('should update service', () => {
        return updateService(fooNewService.name, {
          description: 'foo new description'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })
    })

    test.describe('get services', () => {
      test.it('should return all services', () => {
        return getServices().then(response => {
          return Promise.all([
            test.expect(response.body.length).to.equal(6),
            test.expect(response.statusCode).to.equal(200)
          ])
        })
      })
    })

    test.describe('get service', () => {
      test.it('should return service data', () => {
        return getService(fooService.name).then(response => {
          return Promise.all([
            test.expect(response.body.name).to.equal(fooService.name),
            test.expect(response.body.url).to.equal(fooService.url),
            test.expect(response.statusCode).to.equal(200)
          ])
        })
      })
    })
  })
})
