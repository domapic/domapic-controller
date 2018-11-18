
const test = require('narval')

const pluginsHandler = require('../../../lib/pluginsHandler')
const mocks = require('../mocks')

const waitForFinish = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 200)
  })
}

test.describe('pluginsHandler', () => {
  let commandsMocks
  let baseMocks
  let eventsMocks
  let clientMocks

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    eventsMocks = new mocks.Events()
    clientMocks = new mocks.Client()
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
    eventsMocks.restore()
    clientMocks.restore()
  })

  test.describe('init method', () => {
    test.it('should listen to plugin events, and send them to al registered plugins', () => {
      const fooEventData = {
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          _id: 'foo-id',
          foo: 'foo-data'
        }
      }
      const fooServices = [
        'foo-service-1',
        'foo-service-2'
      ]
      commandsMocks.stubs.service.getFiltered.resolves(fooServices)
      eventsMocks.stubs.emitter.on.returns(fooEventData)
      pluginsHandler.init(baseMocks.stubs.service, commandsMocks.stubs, clientMocks.stubs)
      return waitForFinish()
        .then(() => {
          return Promise.all([
            test.expect(eventsMocks.stubs.emitter.on).to.have.been.called(),
            test.expect(commandsMocks.stubs.service.getFiltered).to.have.been.calledWith({
              type: 'plugin'
            }),
            test.expect(clientMocks.stubs.sendEvent).to.have.been.calledTwice(),
            test.expect(clientMocks.stubs.sendEvent.getCall(0).args[0]).to.equal(fooServices[0]),
            test.expect(clientMocks.stubs.sendEvent.getCall(1).args[0]).to.equal(fooServices[1])
          ])
        })
    })
  })
})
