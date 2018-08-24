
const test = require('narval')

const utils = require('./utils')

test.describe.only('users api', function () {
  const postUser = function (userData) {
    return utils.request('/users', {
      method: 'POST',
      body: userData
    })
  }

  const newUser = {
    name: 'foo name',
    role: 'admin',
    email: 'foo@foo.com'
  }

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
        email: 'asdasdds'
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
        email: newUser.email
      }).then((addResponse) => {
        return utils.request('/users')
          .then((getResponse) => {
            const userId = addResponse.headers.location.split('/').pop()
            const user = getResponse.body[0]
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
        email: 'foo@foo.com'
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
        email: 'foo2@foo.com'
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
        email: 'foo2@foo.com'
      }
      return postUser({
        name: newUser2.name,
        role: newUser2.role,
        email: newUser2.email
      }).then(() => {
        return utils.request('/users')
          .then((getResponse) => {
            const user1 = getResponse.body[0]
            const user2 = getResponse.body[1]
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
