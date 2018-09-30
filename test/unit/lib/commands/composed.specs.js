
const test = require('narval')

const mocks = require('../../mocks')

const composed = require('../../../../lib/commands/composed')

test.describe('composed commands', () => {
  test.describe('Commands instance', () => {
    let commands
    let utilMocks
    let modelsMocks
    let clientMocks
    let baseMocks
    let userCommandsMocks
    let securityTokenCommandsMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      modelsMocks = new mocks.Models()
      clientMocks = new mocks.Client()
      utilMocks = new mocks.Utils()
      userCommandsMocks = new mocks.commands.User()
      securityTokenCommandsMocks = new mocks.commands.SecurityToken()

      commands = composed.Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs, {
        user: userCommandsMocks.stubs.commands,
        securityToken: securityTokenCommandsMocks.stubs.commands
      })
    })

    test.afterEach(() => {
      baseMocks.restore()
      modelsMocks.restore()
      clientMocks.restore()
      userCommandsMocks.restore()
      securityTokenCommandsMocks.restore()
      utilMocks.restore()
    })

    test.describe('initUsers method', () => {
      const fooRegistererUser = {
        _id: 'foo-registerer-user-id'
      }
      test.it('should call to init users command', () => {
        userCommandsMocks.stubs.commands.get.resolves({
          _id: 'foo'
        })
        return commands.initUsers()
          .then(() => {
            return test.expect(userCommandsMocks.stubs.commands.init).to.have.been.called()
          })
      })

      test.describe('when init users add users because database was empty', () => {
        test.it('should call to add a new security token for service registerer', () => {
          userCommandsMocks.stubs.commands.init.resolves([{
            _id: 'foo-user-id-1'
          }, fooRegistererUser])
          userCommandsMocks.stubs.commands.get.resolves(fooRegistererUser)
          return commands.initUsers()
            .then(() => {
              return test.expect(securityTokenCommandsMocks.stubs.commands.add).to.have.been.calledWith(fooRegistererUser, 'apiKey')
            })
        })
      })

      test.describe('when registerer user is not found', () => {
        test.it('should call to add registerer user', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.rejects(new Error())
          userCommandsMocks.stubs.commands.add.resolves(fooRegistererUser)
          return commands.initUsers()
            .then(() => {
              return test.expect(userCommandsMocks.stubs.commands.add).to.have.been.called()
            })
        })
      })

      test.describe('when registerer user security token is not found', () => {
        test.it('should call to add security token for registerer user', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.rejects(new Error())
          userCommandsMocks.stubs.commands.add.resolves(fooRegistererUser)
          securityTokenCommandsMocks.stubs.commands.get.rejects(new Error())
          return commands.initUsers()
            .then(() => {
              return test.expect(securityTokenCommandsMocks.stubs.commands.add).to.have.been.calledWith(fooRegistererUser, 'apiKey')
            })
        })
      })

      test.describe('when registerer user and security token are found', () => {
        test.it('should not call to add user, nor token', () => {
          userCommandsMocks.stubs.commands.init.resolves()
          userCommandsMocks.stubs.commands.get.resolves(fooRegistererUser)
          securityTokenCommandsMocks.stubs.commands.get.resolves()
          return commands.initUsers()
            .then(() => {
              return Promise.all([
                test.expect(userCommandsMocks.stubs.commands.add).to.not.have.been.called(),
                test.expect(securityTokenCommandsMocks.stubs.commands.add).to.not.have.been.called()
              ])
            })
        })
      })
    })
  })
})
