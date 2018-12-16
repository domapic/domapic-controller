
const test = require('narval')

const utils = require('./utils')

test.describe('service-plugin-configs api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let serviceId
  let servicePluginConfigId

  const addServicePluginConfig = servicePluginConfigData => {
    return utils.request('/service-plugin-configs', {
      method: 'POST',
      body: servicePluginConfigData,
      ...authenticator.credentials()
    })
  }

  const updateServicePluginConfig = (id, servicePluginConfigData) => {
    return utils.request(`/service-plugin-configs/${id}`, {
      method: 'PATCH',
      body: servicePluginConfigData,
      ...authenticator.credentials()
    })
  }

  const getServicePluginConfigs = query => {
    return utils.request(`/service-plugin-configs`, {
      method: 'GET',
      query,
      ...authenticator.credentials()
    })
  }

  const getServicePluginConfig = id => {
    return utils.request(`/service-plugin-configs/${id}`, {
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

  const moduleUser = {
    name: 'foo-module-user-for-config',
    role: 'module'
  }

  const fooService = {
    processId: 'foo-service-config-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.112',
    type: 'module'
  }

  const fooService2 = {
    processId: 'foo-service-config-id-2',
    description: 'foo-description-2',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.114',
    type: 'plugin'
  }

  const operatorUser = {
    name: 'foo-operator-2',
    role: 'operator',
    email: 'operator2@foo2.com',
    password: 'foo'
  }

  const adminUser = {
    name: 'foo-admin-for-config',
    role: 'admin',
    email: 'admin-config@foo-config.com',
    password: 'foo'
  }

  const pluginUser = {
    name: 'foo-plugin-for-config',
    role: 'plugin',
    email: 'plugin-config@foo-plugin-config.com',
    password: 'foo'
  }

  test.before(() => {
    return utils.waitOnestimatedStartTime(3000)
      .then(() => utils.doLogin(authenticator))
  })

  test.describe('service plugin configs api', () => {
    test.it('should return forbidden if user has no permissions when creating', () => {
      return utils.ensureUserAndDoLogin(authenticator, operatorUser).then(() => {
        return addServicePluginConfig()
          .then(response => {
            return Promise.all([
              test.expect(response.statusCode).to.equal(403)
            ])
          })
      })
    })

    test.it('should allow to create if provided service belongs to logged user', () => {
      return utils.ensureUserAndDoLogin(authenticator, moduleUser)
        .then(() => {
          return addService(fooService)
            .then(addResponse => {
              serviceId = addResponse.headers.location.split('/').pop()
              return addServicePluginConfig({
                _service: serviceId,
                pluginPackageName: 'foo-domapic-plugin',
                config: {
                  foo: 'foo-data'
                }
              }).then(response => {
                servicePluginConfigId = response.headers.location.split('/').pop()
                return test.expect(response.statusCode).to.equal(201)
              })
            })
        })
    })

    test.it('should allow to update if provided service belongs to logged user', () => {
      return updateServicePluginConfig(servicePluginConfigId, {
        config: {
          foo: ['foo']
        }
      }).then(response => {
        return test.expect(response.statusCode).to.equal(204)
      })
    })

    test.it('should allow to create if user is admin', () => {
      return utils.ensureUserAndDoLogin(authenticator, adminUser)
        .then(() => {
          return addServicePluginConfig({
            _service: serviceId,
            pluginPackageName: 'foo-domapic-plugin-2',
            config: {
              foo: 'foo-data'
            }
          }).then(response => {
            return test.expect(response.statusCode).to.equal(201)
          })
        })
    })

    test.it('should return a bad data error when repeating service and plugin package name', () => {
      return addServicePluginConfig({
        _service: serviceId,
        pluginPackageName: 'foo-domapic-plugin-2',
        config: {
          foo: 'foo-data'
        }
      }).then(response => {
        return Promise.all([
          test.expect(response.statusCode).to.equal(422),
          test.expect(response.body.message).to.contain('provided plugin already exists for same service')
        ])
      })
    })

    test.it('should return a bad data error when service does not exists', () => {
      return addServicePluginConfig({
        _service: 'foo-service-id',
        pluginPackageName: 'foo-domapic-plugin-2',
        config: {
          foo: 'foo'
        }
      }).then(response => {
        return Promise.all([
          test.expect(response.statusCode).to.equal(422),
          test.expect(response.body.message).to.contain('Service not found')
        ])
      })
    })

    test.it('should allow to update if user is admin', () => {
      return updateServicePluginConfig(servicePluginConfigId, {
        config: {
          foo: ['foo', 'foo2']
        }
      }).then(response => {
        return test.expect(response.statusCode).to.equal(204)
      })
    })

    test.it('should allow to create if user is plugin', () => {
      return utils.ensureUserAndDoLogin(authenticator, pluginUser)
        .then(() => {
          return addService(fooService2)
            .then(addResponse => {
              const service2Id = addResponse.headers.location.split('/').pop()
              return addServicePluginConfig({
                _service: service2Id,
                pluginPackageName: 'foo-domapic-plugin-2',
                config: {
                  foo: [
                    {
                      fooData: 'foo'
                    }
                  ]
                }
              }).then(response => {
                return test.expect(response.statusCode).to.equal(201)
              })
            })
        })
    })

    test.it('should allow to update if user is plugin', () => {
      return updateServicePluginConfig(servicePluginConfigId, {
        config: {
          foo: ['foo', 'foo2', 'foo3']
        }
      }).then(response => {
        return test.expect(response.statusCode).to.equal(204)
      })
    })

    test.describe('get', () => {
      test.it('should return all configs', () => {
        return getServicePluginConfigs().then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body.length).to.equal(3)
          ])
        })
      })

      test.it('should return configs filtered by service', () => {
        return getServicePluginConfigs({
          service: serviceId
        }).then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body.length).to.equal(2)
          ])
        })
      })

      test.it('should return configs filtered by pluginPackageName', () => {
        return getServicePluginConfigs({
          'plugin-package-name': 'foo-domapic-plugin-2'
        }).then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body.length).to.equal(2)
          ])
        })
      })

      test.it('should return configs filtered by pluginPackageName and service', () => {
        return getServicePluginConfigs({
          service: serviceId,
          'plugin-package-name': 'foo-domapic-plugin-2'
        }).then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body.length).to.equal(1)
          ])
        })
      })

      test.it('should return config when requesting with id', () => {
        return getServicePluginConfig(servicePluginConfigId).then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body._service).to.equal(serviceId),
            test.expect(response.body.pluginPackageName).to.equal('foo-domapic-plugin'),
            test.expect(response.body.config).to.deep.equal({
              foo: ['foo', 'foo2', 'foo3']
            }),
            test.expect(response.body.uniqueId).to.be.undefined(),
            test.expect(response.body.updatedAt).to.not.be.undefined(),
            test.expect(response.body.createdAt).to.not.be.undefined()
          ])
        })
      })
    })
  })
})
