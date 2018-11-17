
const test = require('narval')

const utils = require('./utils')

test.describe('users api', function () {
  let authenticator = utils.Authenticator()
  let adminUserId
  let pluginId
  let entityId

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

  const getUserMe = function () {
    return utils.request(`/users/me`, {
      method: 'GET',
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
        return utils.expectEvent('user:create', entityId, pluginId)
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

      test.it('should return a not found response when user does not exist', () => {
        return getUser('foo-unexistant-user')
          .then((response) => {
            return Promise.all([
              test.expect(response.body.message).to.equal('User not found'),
              test.expect(response.statusCode).to.equal(404)
            ])
          })
      })
    })
  })

  const testRole = function (user) {
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
        test.it('should return a forbidden error', () => {
          return utils.createUser(authenticator, newUser).then(response => {
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
        test.it('should return a forbidden error if user is different to himself', () => {
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

  testRole(operatorUser)
  testRole(serviceUser)
  testRole(pluginUser)
  testRole(serviceRegistererUser)

  test.describe(`when user has role "service-registerer"`, () => {
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
})
