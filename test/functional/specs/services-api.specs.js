
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
                test.expect(service.id).to.be.undefined(),
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
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let userId
      let fooNewUserService
      const fooNewService = {
        ...fooService,
        name: `foo-${user.role}-service`,
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
      test.it('should add service if provided _user is himself', () => {
        return addService(fooNewService).then(response => {
          return test.expect(response.statusCode).to.equal(201)
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
  })
})
