const test = require('narval')

const mocks = require('../../mocks')

const utils = require('../../../../lib/security/utils')

test.describe('security utils', () => {
  test.describe('cleanUserData method', () => {
    test.it('should return only certain properties of provided user', () => {
      test.expect(utils.cleanUserData({
        _id: 'foo id',
        name: 'foo name',
        email: 'foo email',
        role: 'foo role',
        foo: 'foo',
        password: 'foo pass'
      })).to.deep.equal({
        _id: 'foo id',
        name: 'foo name',
        email: 'foo email',
        role: 'foo role'
      })
    })
  })

  test.describe('GetUserBySecurityToken instance', () => {
    let getUserBySecurityToken
    let commandsMocks

    test.beforeEach(() => {
      commandsMocks = new mocks.Commands()
      getUserBySecurityToken = utils.GetUserBySecurityToken(commandsMocks.stubs)
    })

    test.afterEach(() => {
      commandsMocks.restore()
    })

    test.it('should call to securityToken getUser command, and then return cleaned user', () => {
      const fooToken = 'fooToken'
      commandsMocks.stubs.securityToken.getUser.resolves({
        _id: 'fooId',
        name: 'fooName',
        email: 'fooEmail',
        role: 'fooRole',
        password: 'fooPassword'
      })
      return getUserBySecurityToken(fooToken)
        .then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.securityToken.getUser).to.have.been.calledWith(fooToken),
            test.expect(result).to.deep.equal({
              _id: 'fooId',
              name: 'fooName',
              email: 'fooEmail',
              role: 'fooRole'
            })
          ])
        })
    })

    test.it('should override role to admin if user has adminPermissions property set to true', () => {
      const fooToken = 'fooToken'
      commandsMocks.stubs.securityToken.getUser.resolves({
        _id: 'fooId',
        name: 'fooName',
        email: 'fooEmail',
        role: 'fooRole',
        password: 'fooPassword',
        adminPermissions: true
      })
      return getUserBySecurityToken(fooToken)
        .then(result => {
          return Promise.all([
            test.expect(commandsMocks.stubs.securityToken.getUser).to.have.been.calledWith(fooToken),
            test.expect(result).to.deep.equal({
              _id: 'fooId',
              name: 'fooName',
              email: 'fooEmail',
              role: 'admin'
            })
          ])
        })
    })
  })

  test.describe('AdminOrOwner instance', () => {
    let sandbox
    let authOperation
    let getOwner

    test.beforeEach(() => {
      sandbox = test.sinon.createSandbox()
      getOwner = sandbox.stub().usingPromise().resolves({
        _id: 'foo-id'
      })
      authOperation = utils.AdminOrOwner(getOwner)
    })

    test.afterEach(() => {
      sandbox.restore()
    })

    test.it('should call to provided getOwner function, passing arguments to it', () => {
      const args = [{ _id: 'foo-id' }, 'foo2', 'foo3']
      return authOperation(...args)
        .then(result => {
          return test.expect(getOwner).to.have.been.calledWith(...args)
        })
    })

    test.it('should return true if provided user is an administrator', () => {
      const args = [{ role: 'admin' }, 'foo2', 'foo3']
      return test.expect(authOperation(...args)).to.be.true()
    })

    test.it('should return a rejected promise if provided user _id is not equal to _id returned by getOwner function', () => {
      const args = [{ _id: 'foo-different-id' }, 'foo2', 'foo3']
      return authOperation(...args)
        .then(result => {
          return test.assert.fail()
        }, (err) => {
          return test.expect(err).to.be.an.instanceOf(Error)
        })
    })
  })

  test.describe('onlyAdmin method', () => {
    test.it('should return true if provided user has "admin" role', () => {
      return test.expect(utils.onlyAdmin({
        role: 'admin'
      })).to.be.true()
    })

    test.it('should return false if provided user has not "admin" role', () => {
      return test.expect(utils.onlyAdmin({
        role: 'module'
      })).to.be.false()
    })
  })
})
