
const test = require('narval')

const utils = require('./utils')

test.describe('modules api', function () {
  let authenticator = utils.Authenticator()

  const getModules = function (filters) {
    return utils.request('/modules', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const getModule = function (moduleId) {
    return utils.request(`/modules/${moduleId}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const updateModule = function (moduleId, moduleData) {
    return utils.request(`/modules/${moduleId}`, {
      method: 'PATCH',
      body: moduleData,
      ...authenticator.credentials()
    })
  }

  const addModule = function (moduleData) {
    return utils.request('/modules', {
      method: 'POST',
      body: moduleData,
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

  const fooModule = {
    processId: 'foo-module-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsfds',
    url: 'https://192.168.1.1'
  }

  const fooModule2 = {
    processId: 'foo-module-id',
    description: 'foo-description',
    package: 'foo-package',
    version: '1.0.0',
    apiKey: 'dasasfdfsdf423efwsasdfds',
    url: 'https://192.168.1.42'
  }

  const fooUpdatedModule = {
    description: 'foo updated description',
    package: 'foo updated package',
    version: 'foo updated version',
    apiKey: 'foo updated api key',
    url: 'https://2.2.2.2'
  }

  const fooUpdatedModuleRepeatedUrl = {
    description: 'foo updated description 2',
    package: 'foo updated package 2',
    version: 'foo updated version 2',
    apiKey: 'foo updated api key 2',
    url: 'https://2.2.2.2'
  }

  test.before(() => {
    return utils.doLogin(authenticator)
  })

  test.describe('add module', () => {
    test.describe('when user has module role', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data error if no processId is provided', () => {
        const fooCustomModule = {...fooModule}
        delete fooCustomModule.processId
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "processId"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no package is provided', () => {
        const fooCustomModule = {...fooModule}
        delete fooCustomModule.package
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "package"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no version is provided', () => {
        const fooCustomModule = {...fooModule}
        delete fooCustomModule.version
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "version"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no apiKey is provided', () => {
        const fooCustomModule = {...fooModule}
        delete fooCustomModule.apiKey
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "apiKey"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no url is provided', () => {
        const fooCustomModule = {...fooModule}
        delete fooCustomModule.url
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "url"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a not valid url is provided', () => {
        const fooCustomModule = {...fooModule}
        fooCustomModule.url = 'foo-bad-url'
        return addModule(fooCustomModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('does not conform to the "uri" format'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should add module to database if all provided data pass validation', () => {
        return addModule(fooModule).then((addResponse) => {
          const moduleId = addResponse.headers.location.split('/').pop()
          return getModule(moduleId)
            .then((getResponse) => {
              const fooCustomModule = getResponse.body
              return Promise.all([
                test.expect(fooCustomModule.name).to.equal(moduleUser.name),
                test.expect(fooCustomModule.package).to.equal(fooModule.package),
                test.expect(fooCustomModule.version).to.equal(fooModule.version),
                test.expect(fooCustomModule.url).to.equal(fooModule.url),
                test.expect(fooCustomModule.apiKey).to.be.undefined(),
                test.expect(fooCustomModule.processId).to.equal(fooModule.processId),
                test.expect(fooCustomModule.createdAt).to.not.be.undefined(),
                test.expect(fooCustomModule.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should return a bad data error if one user tries to add more than one module', () => {
        return addModule(fooModule).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('name: Module name already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if repeated url is provided', () => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
          .then(() => {
            return addModule(fooModule).then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.contain('url: Module url already exists'),
                test.expect(response.statusCode).to.equal(422)
              ])
            })
          })
      })
    })
  })

  test.describe('update module', () => {
    let moduleUserModule

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
        .then(() => {
          return addModule(fooModule2).then(res => {
            if (res.statusCode !== 201) {
              return Promise.reject(new Error())
            }
            return utils.ensureUserAndDoLogin(authenticator, moduleUser)
              .then(() => {
                return getModules()
                  .then(getResponse => {
                    moduleUserModule = getResponse.body.find(fooCustomModule => fooCustomModule.name === moduleUser.name)
                    return Promise.resolve()
                  })
              })
          })
        })
    })

    test.describe('when module do not belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser2)
      })

      test.it('should return a forbidden error', () => {
        return updateModule(moduleUserModule._id, {
          description: 'foo-description'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should return a forbidden response when module does not exist', () => {
        return updateModule('foo-unexistant-module-id', {
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

    test.describe('when module belongs to logged user', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, moduleUser)
      })

      test.it('should return a bad data response if trying to update name', () => {
        return updateModule(moduleUserModule._id, {
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
        return updateModule(moduleUserModule._id, {
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
        return updateModule(moduleUserModule._id, {
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
        return updateModule(moduleUserModule._id, {
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
        return updateModule(moduleUserModule._id, {
          url: fooModule2.url
        })
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.contain('url: Module url already exists'),
              test.expect(response.statusCode).to.equal(422)
            ])
          })
      })

      test.it('should update all provided module data', () => {
        return updateModule(moduleUserModule._id, fooUpdatedModule)
          .then((patchResponse) => {
            return getModule(moduleUserModule._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(moduleUser.name),
                  test.expect(data.processId).to.equal(fooModule.processId),
                  test.expect(data.description).to.equal(fooUpdatedModule.description),
                  test.expect(data.package).to.equal(fooUpdatedModule.package),
                  test.expect(data.version).to.equal(fooUpdatedModule.version),
                  test.expect(data.apiKey).to.be.undefined(),
                  test.expect(data.url).to.equal(fooUpdatedModule.url),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })

      test.it('should update all provided module data even when url is same than before', () => {
        return updateModule(moduleUserModule._id, fooUpdatedModuleRepeatedUrl)
          .then((patchResponse) => {
            return getModule(moduleUserModule._id)
              .then((response) => {
                const data = response.body
                return Promise.all([
                  test.expect(data.name).to.equal(moduleUser.name),
                  test.expect(data.processId).to.equal(fooModule.processId),
                  test.expect(data.description).to.equal(fooUpdatedModuleRepeatedUrl.description),
                  test.expect(data.package).to.equal(fooUpdatedModuleRepeatedUrl.package),
                  test.expect(data.version).to.equal(fooUpdatedModuleRepeatedUrl.version),
                  test.expect(data.apiKey).to.be.undefined(),
                  test.expect(data.url).to.equal(fooUpdatedModuleRepeatedUrl.url),
                  test.expect(patchResponse.statusCode).to.equal(204)
                ])
              })
          })
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      let moduleUserModule
      const fooNewModule = {
        ...fooModule,
        url: `https://${user.role}.com`
      }
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user).then(() => {
          return getModules()
            .then(getResponse => {
              moduleUserModule = getResponse.body.find(fooCustomModule => fooCustomModule.name === moduleUser.name)
              return Promise.resolve()
            })
        })
      })

      test.describe('add module', () => {
        test.it('should return a forbidden error', () => {
          return addModule(fooNewModule).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('get modules', () => {
        test.it('should return all existant modules', () => {
          return getModules()
            .then((getResponse) => {
              const module1 = getResponse.body.find(fooCustomModule => fooCustomModule.name === moduleUser.name)
              return Promise.all([
                test.expect(module1.url).to.equal(fooUpdatedModule.url)
              ])
            })
        })
      })

      test.describe('get module', () => {
        test.it('should return module data', () => {
          return getModule(moduleUserModule._id)
            .then((response) => {
              const fooCustomModule = response.body
              return Promise.all([
                test.expect(fooCustomModule._id).to.not.be.undefined(),
                test.expect(fooCustomModule.name).to.equal(moduleUser.name),
                test.expect(fooCustomModule.url).to.equal(fooUpdatedModule.url)
              ])
            })
        })

        test.it('should return a not found response when module does not exist', () => {
          return getModule('foo-unexistant-user-id')
            .then((response) => {
              return Promise.all([
                test.expect(response.body.message).to.equal('Module not found'),
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
