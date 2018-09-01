
const test = require('narval')

const utils = require('./utils')

test.describe('users api', function () {
  let authenticator = utils.Authenticator()

  const postUser = function (userData) {
    return utils.request('/users', {
      method: 'POST',
      body: userData,
      ...authenticator.credentials()
    })
  }

  const getUsers = function () {
    return utils.request('/users', {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const ensureUserAndDoLogin = function (user) {
    return utils.doLogin(authenticator)
      .then(() => {
        return postUser(user).finally(() => utils.doLogin(authenticator, {
          name: user.name,
          email: user.email,
          password: user.password
        }).then(auth => {
          return Promise.resolve()
        }))
      })
  }

  const newUser = {
    name: 'foo service',
    role: 'service',
    email: 'foo2@foo.com',
    password: 'foo'
  }

  const operatorUser = {
    name: 'foo operator',
    role: 'operator',
    email: 'operator@foo.com',
    password: 'foo'
  }

  const serviceUser = {
    name: 'foo service user',
    role: 'service',
    email: 'service@foo.com',
    password: 'foo'
  }

  const pluginUser = {
    name: 'foo plugin',
    role: 'plugin',
    email: 'plugin@foo.com',
    password: 'foo'
  }

  const serviceRegistererUser = {
    name: 'foo service registerer',
    role: 'service-registerer',
    email: 'service-registerer@foo.com',
    password: 'foo'
  }

  test.before(() => {
    return utils.doLogin(authenticator)
  })

  test.describe('when user is admin', () => {
    test.describe('add user', () => {
      test.it('should return a bad data error if no name is provided', () => {
        return postUser({
          role: 'admin'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "name"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no role is provided', () => {
        return postUser({
          name: 'foo name'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "role"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no email is provided', () => {
        return postUser({
          name: 'foo name'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "email"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if no password is provided', () => {
        return postUser({
          name: 'foo name'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('requires property "password"'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a wrong role is provided', () => {
        return postUser({
          name: 'foo name',
          role: 'admidsn'
        }).then((response) => {
          return Promise.all([
            test.expect(response.body.message).to.contain('is not one of enum values: admin,operator,service,service-registerer,plugin'),
            test.expect(response.statusCode).to.equal(422)
          ])
        })
      })

      test.it('should return a bad data error if a wrong email is provided', () => {
        return postUser({
          name: 'foo name',
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
        return postUser({
          name: operatorUser.name,
          role: operatorUser.role,
          email: operatorUser.email,
          password: operatorUser.password
        }).then((addResponse) => {
          return getUsers()
            .then((getResponse) => {
              const userId = addResponse.headers.location.split('/').pop()
              const user = getResponse.body[2]
              return Promise.all([
                test.expect(user._id).to.equal(userId),
                test.expect(user.name).to.equal(operatorUser.name),
                test.expect(user.role).to.equal(operatorUser.role),
                test.expect(user.email).to.equal(operatorUser.email),
                test.expect(user.createdAt).to.not.be.undefined(),
                test.expect(user.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })

      test.it('should return a bad data error if an already existant email is provided', () => {
        return postUser({
          name: 'foo name 2',
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
        return postUser({
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
        return postUser(newUser).then(() => {
          return getUsers()
            .then((getResponse) => {
              const user1 = getResponse.body[2]
              const user2 = getResponse.body[3]
              return Promise.all([
                test.expect(user1.name).to.equal(operatorUser.name),
                test.expect(user1.role).to.equal(operatorUser.role),
                test.expect(user1.email).to.equal(operatorUser.email),
                test.expect(user1.createdAt).to.not.be.undefined(),
                test.expect(user2.name).to.equal(newUser.name),
                test.expect(user2.role).to.equal(newUser.role),
                test.expect(user2.email).to.equal(newUser.email),
                test.expect(user1.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })
    })
  })

  const testRole = function (user) {
    test.describe(`when user has role "${user.role}"`, () => {
      test.before(() => {
        return ensureUserAndDoLogin(user)
      })

      test.describe('add user', () => {
        test.it('should return a forbidden error', () => {
          return postUser(newUser).then(response => {
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
    })
  }

  testRole(operatorUser)
  testRole(serviceUser)
  testRole(pluginUser)

  test.describe(`when user has role "service-registerer"`, () => {
    test.before(() => {
      return ensureUserAndDoLogin(serviceRegistererUser)
    })

    test.describe('add user', () => {
      test.it('should return 201 when adding a new user with role "service"', () => {
        return postUser({
          name: 'foo new service',
          role: 'service',
          email: 'fooNewService@foo.com',
          password: 'foo'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(201)
        })
      })

      test.it('should return a forbidden error when adding a new user with role different to "service"', () => {
        return postUser({
          name: 'foo new admin',
          role: 'admin',
          email: 'fooNewAdmin@foo.com',
          password: 'foo'
        }).then(response => {
          return test.expect(response.statusCode).to.equal(403)
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
  })
})
