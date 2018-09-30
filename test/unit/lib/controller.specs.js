
const test = require('narval')

const mocks = require('../mocks')

const controller = require('../../../lib/controller')

test.describe('controller', () => {
  test.describe('start method', () => {
    const fooSecurityMethods = {
      foo: 'foo'
    }
    let baseMocks
    let indexMocks

    test.beforeEach(() => {
      indexMocks = new mocks.Index()
      indexMocks.stubs.security.methods.resolves(fooSecurityMethods)
      baseMocks = new mocks.Base()
      return controller.start()
    })

    test.afterEach(() => {
      indexMocks.restore()
      baseMocks.restore()
    })

    test.it('should have created a new Service instance', () => {
      test.expect(baseMocks.stubs.Service).to.have.been.called()
    })

    test.it('should have created a new Database instance', () => {
      test.expect(indexMocks.stubs.Database).to.have.been.calledWith(baseMocks.stubs.service)
    })

    test.it('should have created a new Models instance', () => {
      test.expect(indexMocks.stubs.Models).to.have.been.calledWith(baseMocks.stubs.service)
    })

    test.it('should have created a new Client instance', () => {
      test.expect(indexMocks.stubs.Client).to.have.been.calledWith(baseMocks.stubs.service)
    })

    test.it('should have created a new Commands instance', () => {
      test.expect(indexMocks.stubs.Commands).to.have.been.calledWith(baseMocks.stubs.service, indexMocks.stubs.models, indexMocks.stubs.client)
    })

    test.it('should have created a new Security instance', () => {
      test.expect(indexMocks.stubs.Security).to.have.been.calledWith(baseMocks.stubs.service, indexMocks.stubs.commands)
    })

    test.it('should have created a new Api instance', () => {
      test.expect(indexMocks.stubs.Api).to.have.been.calledWith(baseMocks.stubs.service, indexMocks.stubs.commands)
    })

    test.it('should have called to connect to database', () => {
      test.expect(indexMocks.stubs.database.connect).to.have.been.called()
    })

    test.it('should have added authentication to the server', () => {
      test.expect(baseMocks.stubs.service.server.addAuthentication).to.have.been.calledWith(fooSecurityMethods)
    })

    test.it('should have extended server openApi as many times as openapi definitions are', () => {
      const fooOpenApi1 = {fooApi: 'foo'}
      const fooOpenApi2 = {fooApi2: 'foo2'}
      indexMocks.restore()
      baseMocks.restore()
      indexMocks = new mocks.Index()
      baseMocks = new mocks.Base()
      indexMocks.stubs.api.openapis = [
        fooOpenApi1,
        fooOpenApi2
      ]

      return controller.start()
        .then(() => {
          return Promise.all([
            test.expect(baseMocks.stubs.service.server.extendOpenApi).to.have.been.calledTwice(),
            test.expect(baseMocks.stubs.service.server.extendOpenApi.getCall(0).args[0]).to.equal(fooOpenApi1),
            test.expect(baseMocks.stubs.service.server.extendOpenApi.getCall(1).args[0]).to.equal(fooOpenApi2)
          ])
        })
    })

    test.it('should have added operations to server', () => {
      test.expect(baseMocks.stubs.service.server.addOperations).to.have.been.calledWith(indexMocks.stubs.api.operations)
    })

    test.it('should have called to init users command', () => {
      test.expect(indexMocks.stubs.commands.composed.initUsers).to.have.been.called()
    })

    test.it('should have called to start the server', () => {
      test.expect(baseMocks.stubs.service.server.start).to.have.been.called()
    })
  })
})
