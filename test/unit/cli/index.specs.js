
const path = require('path')

const test = require('narval')
const mockery = require('mockery')

test.describe('cli index', function () {
  this.timeout(10000)
  let sandbox
  let baseMock
  let consoleStub
  let previousExitCode
  let mocks
  let options
  let userCommand

  test.before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
  })

  test.after(() => {
    mockery.deregisterAll()
    mockery.disable()
  })

  test.describe('when cli execution finish ok', () => {
    test.beforeEach(() => {
      mockery.resetCache()
      mocks = require('../mocks')
      options = require('../../../lib/options')
      userCommand = require('../../../cli/commands/user')
      previousExitCode = process.exitCode
      sandbox = test.sinon.createSandbox()
      baseMock = new mocks.Base()
      return require('../../../cli/index')
    })

    test.afterEach(() => {
      process.exitCode = previousExitCode
      baseMock.restore()
      sandbox.restore()
    })

    test.it('should called to create a cli from domapic base', () => {
      test.expect(baseMock.stubs.cli).to.have.been.called()
    })

    test.it('should have passed the server script path, service type and package path when created the cli', () => {
      test.expect(baseMock.stubs.cli).to.have.been.calledWith({
        packagePath: path.resolve(__dirname, '..', '..', '..'),
        script: path.resolve(__dirname, '..', '..', '..', 'server.js'),
        customConfig: options,
        customCommands: {
          user: userCommand
        },
        type: 'controller'
      })
    })
  })

  test.describe('when cli execution fails', () => {
    test.afterEach(() => {
      process.exitCode = previousExitCode
      baseMock.restore()
      sandbox.restore()
    })

    test.it('should trace not controlled errors if cli fails', () => {
      const error = new Error('foo')

      mockery.resetCache()
      mocks = require('../mocks')
      previousExitCode = process.exitCode
      sandbox = test.sinon.createSandbox()
      baseMock = new mocks.Base()
      baseMock.stubs.cli.rejects(error)
      consoleStub = sandbox.stub(console, 'error')
      return require('../../../cli/index').then(() => {
        return test.expect(consoleStub).to.have.been.calledWith(error)
      })
    })

    test.it('should not trace controlled errors if cli fails', () => {
      const error = new Error()
      error.isDomapic = true

      mockery.resetCache()
      mocks = require('../mocks')
      previousExitCode = process.exitCode
      sandbox = test.sinon.createSandbox()
      baseMock = new mocks.Base()
      baseMock.stubs.cli.rejects(error)
      consoleStub = sandbox.stub(console, 'error')

      return require('../../../cli/index').then(() => {
        return test.expect(consoleStub).to.not.have.been.called()
      })
    })
  })
})
