
const test = require('narval')

const utils = require('./utils')

test.describe('users api', function () {
  let authenticator
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

  const newUser = {
    name: 'foo name',
    role: 'admin',
    email: 'foo@foo.com',
    password: 'foo'
  }

  test.describe('when user is admin', () => {
    test.before(() => {
      return utils.doLogin()
        .then(auth => {
          authenticator = auth
          return Promise.resolve()
        })
    })

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
            test.expect(response.body.message).to.contain('is not one of enum values: admin,service,plugin'),
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
          name: newUser.name,
          role: newUser.role,
          email: newUser.email,
          password: newUser.password
        }).then((addResponse) => {
          return getUsers()
            .then((getResponse) => {
              const userId = addResponse.headers.location.split('/').pop()
              const user = getResponse.body[2]
              return Promise.all([
                test.expect(user._id).to.equal(userId),
                test.expect(user.name).to.equal(newUser.name),
                test.expect(user.role).to.equal(newUser.role),
                test.expect(user.email).to.equal(newUser.email),
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
          email: 'foo@foo.com',
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
          name: 'foo name',
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
        const newUser2 = {
          name: 'foo service',
          role: 'service',
          email: 'foo2@foo.com',
          password: 'foo'
        }
        return postUser(newUser2).then(() => {
          return getUsers()
            .then((getResponse) => {
              const user1 = getResponse.body[2]
              const user2 = getResponse.body[3]
              return Promise.all([
                test.expect(user1.name).to.equal(newUser.name),
                test.expect(user1.role).to.equal(newUser.role),
                test.expect(user1.email).to.equal(newUser.email),
                test.expect(user1.createdAt).to.not.be.undefined(),
                test.expect(user2.name).to.equal(newUser2.name),
                test.expect(user2.role).to.equal(newUser2.role),
                test.expect(user2.email).to.equal(newUser2.email),
                test.expect(user1.updatedAt).to.not.be.undefined()
              ])
            })
        })
      })
    })
  })
})
