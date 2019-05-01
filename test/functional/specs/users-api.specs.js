
const test = require('narval')

const utils = require('./utils')

test.describe('users api', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()
  let adminUserId
  let pluginId
  let pluginUserId
  let entityId
  let operatorUserId

  const getUsers = function (query) {
    return utils.request('/users', {
      method: 'GET',
      query,
      ...authenticator.credentials()
    })
  }

  const getUser = function (userId) {
    return utils.request(`/users/${userId}`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const updateUser = function (userId, body) {
    return utils.request(`/users/${userId}`, {
      method: 'PATCH',
      body,
      ...authenticator.credentials()
    })
  }

  const deleteUser = function (userId, body) {
    return utils.request(`/users/${userId}`, {
      method: 'DELETE',
      ...authenticator.credentials()
    })
  }

  const getUserMe = function () {
    return utils.request(`/users/me`, {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const getServices = function (filters) {
    return utils.request('/services', {
      method: 'GET',
      query: filters,
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

  const addAbility = function (abilityData) {
    return utils.request('/abilities', {
      method: 'POST',
      body: abilityData,
      ...authenticator.credentials()
    })
  }

  const getApiKey = user => {
    return utils.request('/auth/apikey', {
      method: 'POST',
      body: {
        user
      },
      ...authenticator.credentials()
    })
  }

  const getAbilities = function (filters) {
    return utils.request('/abilities', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const getAccessToken = userData => {
    return utils.getAccessToken(authenticator, userData)
  }

  const getAuthTokens = filters => {
    return utils.request('/auth/tokens', {
      method: 'GET',
      query: filters,
      ...authenticator.credentials()
    })
  }

  const addServicePluginConfig = servicePluginConfigData => {
    return utils.request('/service-plugin-configs', {
      method: 'POST',
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

  const newUser = {
    name: 'foo-service',
    role: 'operator',
    email: 'foo2@foo.com',
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
    role: 'module',
    email: 'service@foo.com',
    password: 'foo'
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
    email: 'service-registerer@foo.com',
    password: 'foo'
  }

  test.before(() => {
    return utils.addPlugin()
      .then(id => {
        pluginId = id
      }).then(() => {
        return utils.doLogin(authenticator)
          .then(() => {
            return getUsers().then(usersResponse => {
              adminUserId = usersResponse.body.find(userData => userData.name === 'admin')._id
            })
          })
      })
  })

  test.describe('when user has permissions', () => {
    test.describe('add user', () => {
      test.it('should return a bad data error if no name is provided', () => {
        return utils.createUser(authenticator, {
          role: 'admin'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "name"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no role is provided', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "role"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no email is provided, and role is not "module" or "plugin"', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name',
          role: 'operator'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('email: Email is required'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no password is provided, and role is not "module" or "plugin"', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name',
          role: 'operator'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('password: Password is required'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a not valid name is provided', () => {
        return utils.createUser(authenticator, {
          name: 'FooName',
          role: 'module'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('does not match pattern'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should allow to create users with role "module" without password and email', () => {
        return utils.createUser(authenticator, {
          name: 'foo-service-name',
          role: 'module'
        }).then((response) => {
          return test.expect(response.statusCode).to.equal(201)
        })
      })

      test.it('should allow to create users with role "plugin" without password and email', () => {
        return utils.createUser(authenticator, {
          name: 'foo-plugin-name',
          role: 'plugin'
        }).then((response) => {
          return test.expect(response.statusCode).to.equal(201)
        })
      })

      test.it('should return a bad data error if a wrong role is provided', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name',
          role: 'admidsn'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('is not one of enum values: admin,operator,module,plugin,service-registerer'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a wrong email is provided', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name',
          role: 'admin',
          email: 'asdasdds',
          password: 'foo'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('email: does not conform to the "email" format'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should add user to database if all provided data pass validation', () => {
        return utils.createUser(authenticator, {
          name: operatorUser.name,
          role: operatorUser.role,
          email: operatorUser.email,
          password: operatorUser.password
        }).then((addResponse) => {
          return getUsers()
            .then((getResponse) => {
              const userId = addResponse.headers.location.split('/').pop()
              entityId = userId
              const user = getResponse.body.find(user => user._id === userId)
              return Promise.all([
                test.expect(user.name).to.equal(operatorUser.name),
                test.expect(user.role).to.equal(operatorUser.role),
                test.expect(user.email).to.equal(operatorUser.email),
                test.expect(user.createdAt).to.not.be.undefined(),
                test.expect(user.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should have sent user creation event to registered plugins', () => {
        return utils.expectEvent('user:created', entityId, pluginId)
      })

      test.it('should return a bad data error if an already existant email is provided', () => {
        return utils.createUser(authenticator, {
          name: 'foo-name-2',
          role: 'admin',
          email: operatorUser.email,
          password: 'foo'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.equal('email: Email already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if an already existant name is provided', () => {
        return utils.createUser(authenticator, {
          name: operatorUser.name,
          role: 'admin',
          email: 'foo2@foo.com',
          password: 'foo'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.equal('name: User name already exists'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })
    })

    test.describe('get users', () => {
      test.it('should return all existant users', () => {
        return utils.createUser(authenticator, newUser).then(() => {
          return getUsers()
            .then((getResponse) => {
              const user1 = getResponse.body.find(user => user.name === operatorUser.name)
              const user2 = getResponse.body.find(user => user.name === newUser.name)
              return Promise.all([
                test.expect(user1.role).to.equal(operatorUser.role),
                test.expect(user1.email).to.equal(operatorUser.email),
                test.expect(user1.createdAt).to.not.be.undefined(),
                test.expect(user2.role).to.equal(newUser.role),
                test.expect(user2.email).to.equal(newUser.email),
                test.expect(user1.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should return users filtering by name', () => {
        return getUsers({
          name: newUser.name
        })
          .then(getResponse => {
            const user1 = getResponse.body.find(user => user.name === operatorUser.name)
            const user2 = getResponse.body.find(user => user.name === newUser.name)
            return Promise.all([
              test.expect(user1).to.be.undefined(),
              test.expect(user2.role).to.equal(newUser.role),
              test.expect(user2.email).to.equal(newUser.email),
              test.expect(user2.name).to.equal(newUser.name)
            ])
          })
      })

      test.it('should return users filtering by role', () => {
        return getUsers({
          role: 'admin'
        })
          .then(getResponse => {
            const noAdminUser = getResponse.body.find(user => user.role !== 'admin')
            return Promise.all([
              test.expect(getResponse.statusCode).to.equal(200),
              test.expect(noAdminUser).to.be.undefined()
            ])
          })
      })
    })

    test.describe('get user', () => {
      test.it('should return user data', () => {
        return getUsers()
          .then((getResponse) => {
            const userId = getResponse.body.find(user => user.name === newUser.name)._id
            return getUser(userId)
              .then((response) => {
                const user = response.body
                return Promise.all([
                  test.expect(user._id).to.not.be.undefined(),
                  test.expect(user.name).to.equal(newUser.name),
                  test.expect(user.role).to.equal(newUser.role),
                  test.expect(user.email).to.equal(newUser.email),
                  test.expect(user.createdAt).to.not.be.undefined(),
                  test.expect(user.updatedAt).to.not.be.undefined()
                ])
              })
          })
      })

      test.it('should return a Not authorized response when user does not exist', () => {
        return getUser('foo-unexistant-user')
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.equal('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
      })
    })
  })

  const testRole = function (user, userToAdd) {
    test.describe(`when user has role "${user.role}"`, () => {
      let userId

      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, user)
          .then(() => {
            return utils.doLogin(authenticator)
              .then(() => {
                return getUsers().then(usersResponse => {
                  userId = usersResponse.body.find(userData => userData.name === user.name)._id
                  return Promise.resolve()
                })
              })
          })
          .then(() => {
            return utils.ensureUserAndDoLogin(authenticator, user)
          })
      })

      test.describe('add user', () => {
        test.it(`should return a forbidden error when adding user with role ${userToAdd.role}`, () => {
          return utils.createUser(authenticator, userToAdd).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('get users', () => {
        test.it('should return a forbidden error', () => {
          return getUsers().then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })
      })

      test.describe('get user', () => {
        test.it('should return a forbidden error when request user is admin', () => {
          return getUser(adminUserId).then(response => {
            return Promise.all([
              test.expect(response.body.message).to.contain('Not authorized'),
              test.expect(response.statusCode).to.equal(403)
            ])
          })
        })

        test.it('should return user data if user is himself', () => {
          return getUser(userId).then(response => {
            return Promise.all([
              test.expect(response.body.name).to.equal(user.name),
              test.expect(response.body.email).to.equal(user.email),
              test.expect(response.body.role).to.equal(user.role),
              test.expect(response.statusCode).to.equal(200)
            ])
          })
        })
      })
    })
  }

  testRole(operatorUser, newUser)
  testRole(serviceUser, newUser)
  testRole(pluginUser, serviceUser)
  testRole(serviceRegistererUser, newUser)

  test.describe('update user', () => {
    let moduleUserId

    test.before(() => {
      return utils.doLogin(authenticator)
        .then(() => {
          return getUsers().then(usersResponse => {
            operatorUserId = usersResponse.body.find(userData => userData.role === 'operator')._id
            moduleUserId = usersResponse.body.find(userData => userData.role === 'module')._id
            pluginUserId = usersResponse.body.find(userData => userData.role === 'plugin')._id
            return Promise.resolve()
          })
        })
    })

    test.describe('when user is admin', () => {
      test.it('should return a bad data error when trying to update email', () => {
        return updateUser(adminUserId, {
          role: 'admin',
          email: 'foo-other-email@foo.com'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('"email" exists in instance when not allowed'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should be able to update self data, including role', () => {
        return updateUser(adminUserId, {
          role: 'admin'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })

      test.it('should be able to update data of operator users, including role', () => {
        return updateUser(operatorUserId, {
          password: 'foo',
          role: 'operator'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })

      test.it('should not be able to update data of module users', () => {
        return updateUser(moduleUserId, {
          password: 'foo'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should not be able to update data of plugin users', () => {
        return updateUser(pluginUserId, {
          password: 'foo'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should be able to update adminPermissions of plugin users', () => {
        return getUsers().then(usersResponse => {
          return Promise.resolve(usersResponse.body.find(userData => userData.name === 'foo-plugin')._id)
        }).then(pluginId => {
          return updateUser(pluginId, {
            adminPermissions: true
          }).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })
    })

    test.describe('when user has role "plugin" with adminPermissions checked and is logged using api key', () => {
      let pluginUserId
      let pluginApiKey

      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, pluginUser).then(() => {
          return getUserMe().then(response => {
            pluginUserId = response.body._id
            return getApiKey(pluginUserId).then(response => {
              console.log(response.body)
              pluginApiKey = response.body.apiKey
              console.log('----------------- pluginApiKey')
              console.log(pluginApiKey)
              authenticator.loginApiKey(response.body.name, pluginApiKey)
              return Promise.resolve()
            })
          })
        })
      })

      test.after(() => {
        return updateUser(pluginUserId, {
          adminPermissions: false
        })
      })

      test.it('should be able to update data of operator users, including role', () => {
        return updateUser(operatorUserId, {
          password: 'foo',
          role: 'operator'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })
    })

    test.describe('when user is operator', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, operatorUser)
      })

      test.it('should be able to update self data', () => {
        return updateUser(operatorUserId, {
          password: 'foo'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(204)
        })
      })

      test.it('should not be able to update self role', () => {
        return updateUser(operatorUserId, {
          password: 'foo',
          role: 'admin'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should not be able to update data of module users', () => {
        return updateUser(moduleUserId, {
          password: 'foo',
          role: 'admin'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should not be able to update data of plugin users', () => {
        return updateUser(pluginUserId, {
          password: 'foo',
          role: 'admin'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })
    })

    test.describe('when user is module', () => {
      test.before(() => {
        return utils.ensureUserAndDoLogin(authenticator, operatorUser)
      })

      test.it('should not be able to update self data', () => {
        return updateUser(moduleUserId, {
          password: 'foo'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })

      test.it('should not be able to update other users data', () => {
        return updateUser(pluginUserId, {
          password: 'foo'
        }).then(response => {
          return Promise.all([
            test.expect(response.body.message).to.contain('Not authorized'),
            test.expect(response.statusCode).to.equal(403)
          ])
        })
      })
    })
  })

  test.describe('when user has role "plugin"', () => {
    let operatorUserId
    const newOperatorUser = {
      name: 'foo-operator-2',
      role: 'operator',
      email: 'operator-2@foo.com',
      password: 'foo'
    }

    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, pluginUser)
    })

    test.it('should not be able to update self data', () => {
      return updateUser(pluginUserId, {
        adminPermissions: true
      }).then(response => {
        return Promise.all([
          test.expect(response.body.message).to.contain('Not authorized'),
          test.expect(response.statusCode).to.equal(403)
        ])
      })
    })

    test.describe('add user', () => {
      test.it('should return 201 when adding a new user with role "operator"', () => {
        return utils.createUser(authenticator, newOperatorUser).then(response => {
          operatorUserId = response.headers.location.split('/').pop()
          return test.expect(response.statusCode).to.equal(201)
        })
      })
    })

    test.describe('get users', () => {
      test.it('should return users if query role has "operator" value', () => {
        return getUsers({
          role: 'operator'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(200)
        })
      })
    })

    test.describe('get user', () => {
      test.it('should return user if it is an operator', () => {
        return getUser(operatorUserId).then(response => {
          return Promise.all([
            test.expect(response.statusCode).to.equal(200),
            test.expect(response.body.name).to.equal(newOperatorUser.name),
            test.expect(response.body.email).to.equal(newOperatorUser.email)
          ])
        })
      })
    })
  })

  test.describe(`when user has role "service-registerer"`, () => {
    let newUserId
    test.before(() => {
      return utils.ensureUserAndDoLogin(authenticator, serviceRegistererUser)
    })

    test.describe('add user', () => {
      test.it('should return 201 when adding a new user with role "module"', () => {
        return utils.createUser(authenticator, {
          name: 'foo-new-service',
          role: 'module',
          email: 'fooNewService@foo.com',
          password: 'foo'
        }).then(response => {
          newUserId = response.headers.location.split('/').pop()
          return test.expect(response.statusCode).to.equal(201)
        })
      })

      test.it('should return a forbidden error when adding a new user with role different to "module"', () => {
        return utils.createUser(authenticator, {
          name: 'foo-new-admin',
          role: 'admin',
          email: 'fooNewAdmin@foo.com',
          password: 'foo'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(403)
        })
      })
    })

    test.describe('get users', () => {
      test.it('should return users if query role has "module" value', () => {
        return getUsers({
          role: 'module'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(200)
        })
      })
    })

    test.describe('get user', () => {
      test.it('should return user if it has "module" role', () => {
        return getUser(newUserId).then(response => {
          return test.expect(response.statusCode).to.equal(200)
        })
      })
    })
  })

  test.describe('get users/me api', () => {
    const testUser = (userData) => {
      test.it(`should return ${userData.name} data when ${userData.name} is logged in`, () => {
        return utils.doLogin(authenticator, userData)
          .then(() => {
            return getUserMe()
              .then((response) => {
                const user = response.body
                return Promise.all([
                  test.expect(user.name).to.equal(userData.name),
                  test.expect(user.email).to.equal(userData.email),
                  test.expect(user.role).to.equal(userData.role)
                ])
              })
          })
      })
    }

    testUser(newUser)
    testUser(operatorUser)
    testUser(serviceUser)
    testUser(pluginUser)
    testUser(serviceRegistererUser)
  })

  test.describe('delete user', () => {
    let serviceId
    let userId

    test.before(() => {
      return utils.doLogin(authenticator)
        .then(() => {
          return getUsers()
            .then(response => {
              userId = response.body.find(user => user.name === serviceUser.name)._id
              return Promise.resolve()
            })
        })
        .then(() => {
          return utils.ensureUserAndDoLogin(authenticator, serviceUser)
        })
        .then(() => {
          return getAccessToken(serviceUser)
        })
        .then(() => {
          return addService({
            processId: 'foo-service-id',
            description: 'foo-description',
            package: 'foo-package',
            version: '1.0.0',
            apiKey: 'dasasfdfsdf423efwsfds',
            url: 'https://192.168.1.1',
            type: 'module'
          }).then(response => {
            serviceId = response.headers.location.split('/').pop()
            return Promise.resolve()
          })
        })
        .then(() => {
          return addAbility({
            name: 'foo-ability-name'
          })
        })
        .then(() => {
          return addServicePluginConfig({
            _service: serviceId,
            pluginPackageName: 'foo-plugin',
            config: {
              foo: 'foo-data'
            }
          })
        })
    })

    test.describe('when user is not admin', () => {
      test.it('should return a forbidden error', () => {
        return deleteUser(userId).then(response => {
          return test.expect(response.statusCode).to.equal(403)
        })
      })
    })

    test.describe('when user is admin', () => {
      test.before(() => {
        return utils.doLogin(authenticator)
      })

      test.describe('when deleting an operator', () => {
        test.it('should delete user', () => {
          return deleteUser(operatorUserId).then(response => {
            return test.expect(response.statusCode).to.equal(204)
          })
        })
      })

      test.describe('when is deleting a service', () => {
        test.it('should delete user and all related services, abilities, securityTokens and servicePluginConfigs', () => {
          return Promise.all([
            getServices(),
            getAbilities(),
            getAuthTokens(),
            getServicePluginConfigs()
          ]).then(previousResults => {
            return deleteUser(userId).then(response => {
              return Promise.all([
                getServices(),
                getAbilities(),
                getAuthTokens(),
                getServicePluginConfigs(),
                getUsers()
              ]).then(afterResults => {
                const previousServices = previousResults[0].body.filter(service => service._user === userId)
                const previousAbilities = previousResults[1].body.filter(ability => ability._service === serviceId)
                const previousTokens = previousResults[2].body.filter(token => token._user === userId)
                const previousServicesConfigs = previousResults[3].body.filter(serviceConfig => serviceConfig._service === serviceId)

                const afterServices = afterResults[0].body.filter(service => service._user === userId)
                const afterAbilities = afterResults[1].body.filter(ability => ability._service === serviceId)
                const afterTokens = afterResults[2].body.filter(token => token._user === userId)
                const afterServicesConfigs = afterResults[3].body.filter(serviceConfig => serviceConfig._service === serviceId)

                const afterUser = afterResults[4].body.find(user => user.name === serviceUser.name)

                return Promise.all([
                  test.expect(response.statusCode).to.equal(204),
                  test.expect(previousServices.length).to.be.above(0),
                  test.expect(previousAbilities.length).to.be.above(0),
                  test.expect(previousTokens.length).to.be.above(0),
                  test.expect(previousServicesConfigs.length).to.be.above(0),
                  test.expect(afterServices.length).to.equal(0),
                  test.expect(afterAbilities.length).to.equal(0),
                  test.expect(afterTokens.length).to.equal(0),
                  test.expect(afterServicesConfigs.length).to.equal(0),
                  test.expect(afterUser).to.be.undefined()
                ])
              })
            })
          })
        })
      })
    })
  })
})
