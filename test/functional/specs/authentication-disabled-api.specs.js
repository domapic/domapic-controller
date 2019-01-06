
const test = require('narval')

const utils = require('./utils')

test.describe('when authentication is disabled', function () {
  const getUsers = query => utils.request('/users', {
    method: 'GET',
    query
  })

  const createUser = userData => utils.request(`/users`, {
    method: 'POST',
    body: userData
  })

  test.describe('users api', () => {
    test.describe('create user', () => {
      test.it('should add user to database if all provided data pass validation', () => {
        return createUser({
          name: 'foo-user-module',
          role: 'module'
        }).then(addResponse => {
          return getUsers()
            .then(getResponse => {
              const userId = addResponse.headers.location.split('/').pop()
              const user = getResponse.body.find(user => user._id === userId)
              return Promise.all([
                test.expect(user.name).to.equal('foo-user-module'),
                test.expect(user.role).to.equal('module')
              ])
            })
        })
      })
    })

    /* test.describe('get users', () => {
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

    test.describe('get users/me api', () => {

    }) */
  })
})
