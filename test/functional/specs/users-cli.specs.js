const childProcess = require('child_process')

const test = require('narval')

const utils = require('./utils')

test.describe('users cli', function () {
  this.timeout(10000)
  let authenticator = utils.Authenticator()

  const getUsers = function () {
    return utils.request('/users', {
      method: 'GET',
      ...authenticator.credentials()
    })
  }

  const executeCli = (action, options = {}) => {
    const name = options.name ? [options.name] : ['']
    const email = options.email ? `--email=${options.email}` : ''
    const password = options.password ? `--password=${options.password}` : ''
    const role = options.role ? `--role=${options.role}` : ''

    return new Promise((resolve, reject) => {
      const log = []
      const logError = []
      const spawn = childProcess.spawn('npm', ['run', 'domapic-controller', 'user']
        .concat([action])
        .concat(name)
        .concat('--')
        .concat([role, email, password])
        .concat(`--path=${process.env.domapic_path}`))

      spawn.stdout.on('data', data => {
        log.push(data)
      })

      spawn.stderr.on('data', data => {
        logError.push(data)
      })

      spawn.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(logError.join('\n')))
        } else {
          resolve(log.join('\n'))
        }
      })
    })
  }

  const adminUser = {
    name: 'foo-admin',
    role: 'admin',
    email: 'foo-admin@foo.com',
    password: 'foo'
  }

  const serviceUser = {
    name: 'foo-service-user',
    role: 'module'
  }

  test.before(() => {
    return utils.doLogin(authenticator)
  })

  test.describe('when action is different to "add" or "remove"', () => {
    test.it('should throw an error', () => {
      return executeCli('unkown')
        .then(() => {
          return test.assert.fail()
        }, error => {
          return test.expect(error.message).to.contain('Method Not Allowed: Action must be one of add, remove')
        })
    })
  })

  test.describe('when action is "add"', () => {
    test.it('should throw an error if email is not valid', () => {
      const fooEmail = 'foo-email'
      return executeCli('add', {
        ...adminUser,
        ...{
          email: fooEmail
        }
      }).then(() => {
        return test.assert.fail()
      }, error => {
        return test.expect(error.message).to.contain(`"${fooEmail}" is not a valid email`)
      })
    })

    test.it('should throw an error if name is not valid', () => {
      const fooName = 'FooName'
      return executeCli('add', {
        ...adminUser,
        ...{
          name: fooName
        }
      }).then(() => {
        return test.assert.fail()
      }, error => {
        return test.expect(error.message).to.contain('Name must contain only')
      })
    })

    test.it('should add user to database when all data is provided', () => {
      return executeCli('add', adminUser).then(() => getUsers().then(response => {
        const newUser = response.body.find(user => user.name === adminUser.name)
        return Promise.all([
          test.expect(newUser.role).to.equal(adminUser.role),
          test.expect(newUser.email).to.equal(adminUser.email),
          test.expect(newUser.updatedAt).to.not.be.undefined(),
          test.expect(newUser.createdAt).to.not.be.undefined()
        ])
      }))
    })

    test.it('should add user to database when no email nor password are provided and role is service', () => {
      return executeCli('add', serviceUser).then(() => getUsers().then(response => {
        const newUser = response.body.find(user => user.name === adminUser.name)
        return Promise.all([
          test.expect(newUser.role).to.equal(adminUser.role),
          test.expect(newUser.updatedAt).to.not.be.undefined(),
          test.expect(newUser.createdAt).to.not.be.undefined()
        ])
      }))
    })
  })

  test.describe('when action is "remove"', () => {
    test.it('should remove user from database', () => {
      return executeCli('remove', {
        name: adminUser.name
      }).then(() => getUsers().then(response => {
        const newUser = response.body.find(user => user.name === adminUser.name)
        return test.expect(newUser).to.be.undefined()
      }))
    })
  })
})
