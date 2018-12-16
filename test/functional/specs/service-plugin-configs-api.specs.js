
const test = require('narval')

const utils = require('./utils')

test.describe('service-plugin-configs api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let serviceId
  // let servicePluginConfigId

  const addServicePluginConfig = servicePluginConfigData => {
    return utils.request('/service-plugin-configs', {
      method: 'POST',
      body: servicePluginConfigData,
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
    test.describe('add config', () => {
      test.it('should return forbidden if user has no permissions', () => {
        return utils.ensureUserAndDoLogin(authenticator, operatorUser).then(() => {
          return addServicePluginConfig()
            .then(response => {
              return Promise.all([
                test.expect(response.statusCode).to.equal(403)
              ])
            })
        })
      })

      test.it('should allow to add if provided service belongs to logged user', () => {
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
                  // servicePluginConfigId = response.headers.location.split('/').pop()
                  return test.expect(response.statusCode).to.equal(201)
                })
              })
          })
      })

      test.it('should allow to add if user is admin', () => {
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

      test.it('should allow to add if user is plugin', () => {
        return utils.ensureUserAndDoLogin(authenticator, pluginUser)
          .then(() => {
            return addServicePluginConfig({
              _service: serviceId,
              pluginPackageName: 'foo-domapic-plugin-3',
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
  })
})
