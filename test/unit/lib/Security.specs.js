
const test = require('narval')

const mocks = require('../mocks')

const Security = require('../../../lib/Security')
const jwt = require('../../../lib/security/jwt')
const apiKey = require('../../../lib/security/apiKey')
const disabled = require('../../../lib/security/disabled')

test.describe('Security', () => {
  const jwtMock = {
    authenticateHandler: 'foo jwt authenticate handler',
    revokeAuth: 'foo jwt revokeAuth handler',
    revokeHandler: 'foo jwt revoke handler'
  }
  const apiKeyMock = {
    verify: 'foo verify handler',
    authenticateAuth: 'foo apikey auth handler',
    authenticateHandler: 'foo apikey authenticate handler',
    revokeAuth: 'foo apikey revokeAuth handler',
    revokeHandler: 'foo apikey revoke handler'
  }
  const disabledMock = {
    verify: 'foo disabled verify handler'
  }

  let sandbox
  let jwtStub
  let apiKeyStub
  let disabledStub
  let baseMocks
  let commandsMocks
  let security

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox()
    jwtStub = sandbox.stub(jwt, 'Methods').returns(jwtMock)
    apiKeyStub = sandbox.stub(apiKey, 'Methods').returns(apiKeyMock)
    disabledStub = sandbox.stub(disabled, 'Methods').returns(disabledMock)
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    security = Security(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
    sandbox.restore()
  })

  test.describe('instance', () => {
    test.it('should have created a jwt methods instance', () => {
      test.expect(jwtStub).to.have.been.calledWith(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.it('should have created an apiKey methods instance', () => {
      test.expect(apiKeyStub).to.have.been.calledWith(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.it('should have created an apiKey methods instance', () => {
      test.expect(apiKeyStub).to.have.been.calledWith(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.it('should have created a disabled methods instance', () => {
      test.expect(disabledStub).to.have.been.calledWith(baseMocks.stubs.service, commandsMocks.stubs)
    })

    test.describe('methods', () => {
      let methods
      test.before(() => {
        return security.methods().then(returnedMethods => {
          methods = returnedMethods
        })
      })

      test.it('should call to base service to get "secret" config, and return it in the jwt.secret property', () => {
        const fooSecret = 'foo secret'
        baseMocks.stubs.service.config.get.resolves(fooSecret)
        return security.methods().then(securityMethods => {
          return Promise.all([
            test.expect(baseMocks.stubs.service.config.get).to.have.been.calledWith('secret'),
            test.expect(securityMethods.jwt.secret).to.equal(fooSecret)
          ])
        })
      })

      test.it('should expose jwt authenticate handler method', () => {
        test.expect(methods.jwt.authenticate.handler).to.equal(jwtMock.authenticateHandler)
      })

      test.it('should expose jwt revoke auth method', () => {
        test.expect(methods.jwt.revoke.auth).to.equal(jwtMock.revokeAuth)
      })

      test.it('should expose jwt revoke handler method', () => {
        test.expect(methods.jwt.revoke.handler).to.equal(jwtMock.revokeHandler)
      })

      test.it('should expose apiKey verify method', () => {
        test.expect(methods.apiKey.verify).to.equal(apiKeyMock.verify)
      })

      test.it('should expose apiKey authenticate auth method', () => {
        test.expect(methods.apiKey.authenticate.auth).to.equal(apiKeyMock.authenticateAuth)
      })

      test.it('should expose apiKey authenticate handler method', () => {
        test.expect(methods.apiKey.authenticate.handler).to.equal(apiKeyMock.authenticateHandler)
      })

      test.it('should expose apiKey revoke auth method', () => {
        test.expect(methods.apiKey.revoke.auth).to.equal(apiKeyMock.revokeAuth)
      })

      test.it('should expose apiKey revoke handler method', () => {
        test.expect(methods.apiKey.revoke.handler).to.equal(apiKeyMock.revokeHandler)
      })

      test.it('should expose disabled verify handler method', () => {
        test.expect(methods.disabled.verify).to.equal(disabledMock.verify)
      })
    })
  })
})
