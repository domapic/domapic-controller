
const test = require('narval')

const socketsHandler = require('../../../lib/socketsHandler')
const securityUtils = require('../../../lib/security/utils')
const mocks = require('../mocks')

const waitForFinish = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 200)
  })
}

test.describe('socketsHandler', () => {
  const anonymousUser = {
    role: 'anonymous',
    name: 'foo'
  }
  const authUser = {
    role: 'admin',
    name: 'foo-auth-user'
  }
  const result = {}
  const cb = (error, value) => {
    result.error = error;
    result.value = value;
  }
  let commandsMocks
  let baseMocks
  let eventsMocks
  let libsMocks
  let getAnonymousUserStub
  let getUserBySecurityTokenStub
  let socket
  let sandbox

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox()
    socket = { handshake: {}, emit: sandbox.stub(), id: 'foo-id', on: sandbox.stub(), auth: true}
    getAnonymousUserStub = sandbox.stub().resolves(anonymousUser)
    getUserBySecurityTokenStub = sandbox.stub().resolves(authUser)
    sandbox.stub(securityUtils, 'GetAnonymousUser').returns(getAnonymousUserStub)
    sandbox.stub(securityUtils, 'GetUserBySecurityToken').returns(getUserBySecurityTokenStub)
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    eventsMocks = new mocks.Events()
    eventsMocks.stubs.emitter.on.runOnRegister(false)
    libsMocks = new mocks.Libs()
    baseMocks.stubs.service.config.get.resolves({auth:false})
    return socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
    eventsMocks.restore()
    libsMocks.restore()
    sandbox.restore()
  })

  test.describe('init method', () => {
    test.it('should have inited socketIo', () => {
      return test.expect(libsMocks.stubs.socketIo).to.have.been.calledWith(baseMocks.stubs.service.server)
    })

    test.it('should have inited socketIoAuth', () => {
      return test.expect(libsMocks.stubs.socketIoAuth).to.have.been.calledWith(libsMocks.stubs.socketIo.instance)
    })

    test.it('should have added a listener to socket events', () => {
      return Promise.all([
        test.expect(eventsMocks.stubs.emitter.on).to.have.been.called(),
        test.expect(eventsMocks.stubs.emitter.on.getCall(0).args[0]).to.equal("socket")
      ])
    })

    test.it('should have added a listener to socketIo connections', () => {
      return test.expect(libsMocks.stubs.socketIo.instance.on).to.have.been.called()
    })
  })

  test.describe('socket authentication', () => {
    test.it('should return true is authentication is disabled', async () => {
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      return Promise.all([
        test.expect(result.error).to.equal(null),
        test.expect(result.value).to.equal(true)
      ])
    })

    test.it('should return anonymous user is authentication is disabled for current IP', async () => {
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      baseMocks.stubs.service.config.get.resolves({auth:true})
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
      return Promise.all([
        test.expect(result.error).to.equal(null),
        test.expect(result.value).to.equal(true),
        test.expect(socket.userData).to.equal(anonymousUser)
      ])
    })

    test.it('should return an error if recovering anonymous user throws', async () => {
      const error = new Error()
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      baseMocks.stubs.service.config.get.resolves({auth:true})
      getAnonymousUserStub.rejects(error)
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
      return Promise.all([
        test.expect(result.error).to.equal(error),
        test.expect(result.value).to.equal(false)
      ])
    })

    test.it('should return user data is authentication is enabled for current IP', async () => {
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      libsMocks.stubs.ipRangeCheck.returns(false)
      baseMocks.stubs.service.config.get.resolves({auth:true})
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
      return Promise.all([
        test.expect(result.error).to.equal(null),
        test.expect(result.value).to.equal(true),
        test.expect(socket.userData).to.equal(authUser)
      ])
    })

    test.it('should return an error if recovering current user throws', async () => {
      const error = new Error()
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      libsMocks.stubs.ipRangeCheck.returns(false)
      baseMocks.stubs.service.config.get.resolves({auth:true})
      getUserBySecurityTokenStub.rejects(error)
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
      return Promise.all([
        test.expect(result.error).to.equal(error),
        test.expect(result.value).to.equal(false)
      ])
    })
  })

  test.describe('socket events emitter', () => {
    test.beforeEach(async () => {
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      libsMocks.stubs.ipRangeCheck.returns(false)
      baseMocks.stubs.service.config.get.resolves({auth:true})
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
    })

    test.it('should send event to all current authenticated users', async () => {
      eventsMocks.stubs.emitter.on.getCall(1).args[1]({
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          fooData: 'foo-data'
        }
      })
      return Promise.all([
        test.expect(socket.emit.getCall(0).args[0]).to.equal('foo-entity:foo-operation'),
        test.expect(socket.emit.getCall(0).args[1]).to.deep.equal({
          fooData: 'foo-data'
        })
      ])
    })

    test.it('should send event only to allowed roles if roles are received', async () => {
      eventsMocks.stubs.emitter.on.getCall(1).args[1]({
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          fooData: 'foo-data'
        },
        roles: ['admin']
      })
      return Promise.all([
        test.expect(socket.emit.getCall(0).args[0]).to.equal('foo-entity:foo-operation'),
        test.expect(socket.emit.getCall(0).args[1]).to.deep.equal({
          fooData: 'foo-data'
        })
      ])
    })

    test.it('should not send event if authenticated user does not belong to allowed role', async () => {
      eventsMocks.stubs.emitter.on.getCall(1).args[1]({
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          fooData: 'foo-data'
        },
        roles: []
      })
      return test.expect(socket.emit).to.not.have.been.called()
    })
  })

  test.describe('on socket connection', () => {
    test.beforeEach(async () => {
      libsMocks.restore()
      libsMocks = new mocks.Libs()
      libsMocks.stubs.ipRangeCheck.returns(false)
      baseMocks.stubs.service.config.get.resolves({auth:true})
      await socketsHandler.init(baseMocks.stubs.service.server, baseMocks.stubs.service, commandsMocks.stubs)
      await libsMocks.stubs.socketIoAuth.getCall(0).args[1].authenticate(socket, {}, cb);
      await waitForFinish()
    })

    test.it('should add a listener for removing authenticated user when disconnected', () => {
      libsMocks.stubs.socketIo.instance.on.getCall(0).args[1](socket)
      socket.on.getCall(0).args[1]()
      eventsMocks.stubs.emitter.on.getCall(1).args[1]({
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          fooData: 'foo-data'
        }
      })
      return test.expect(socket.emit).to.not.have.been.called()
    })

    test.it('should not remove user when disconnected if it was not authenticated', () => {
      socket.auth = false
      libsMocks.stubs.socketIo.instance.on.getCall(0).args[1](socket)
      socket.on.getCall(0).args[1]()
      eventsMocks.stubs.emitter.on.getCall(1).args[1]({
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          fooData: 'foo-data'
        }
      })
      return test.expect(socket.emit).to.have.been.called()
    })
  })
})
