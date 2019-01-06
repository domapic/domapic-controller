
const test = require('narval')

const mocks = require('../../mocks')

const Security = require('../../../../lib/security/disabled')

test.describe('apiKey security', () => {
  let baseMocks
  let commandsMocks
  let security

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    security = Security.Methods(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
  })

  test.describe('Methods', () => {
    test.describe('verify handler', () => {
      const user = {
        _id: 'fooId',
        name: 'fooName',
        email: 'fooEmail',
        role: 'fooRole',
        password: 'fooPassword'
      }

      const cleanUser = {
        _id: 'fooId',
        name: 'fooName',
        email: 'fooEmail',
        role: 'fooRole'
      }

      test.beforeEach(() => {
        commandsMocks.stubs.user.get.resolves(user)
      })

      test.it('should get anonymous user and return it', () => {
        return security.verify().then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.user.get).to.have.been.calledWith({
              name: 'anonymous'
            }),
            test.expect(result).to.deep.equal(cleanUser)
          ])
        })
      })

      test.it('should cache the anonymous user and not call to the get command more than once', () => {
        return Promise.all([
          security.verify(),
          security.verify(),
          security.verify(),
          security.verify()
        ]).then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.user.get).to.have.been.calledOnce(),
            test.expect(result[0]).to.deep.equal(cleanUser)
          ])
        })
      })
    })
  })
})
