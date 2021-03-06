
const test = require('narval')

const mocks = require('../mocks')

const Client = require('../../../lib/Client')

test.describe('Client', () => {
  let baseMocks
  let client

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    client = Client(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('sendAction method', () => {
      const fooServiceData = {
        url: 'foo-service-url',
        apiKey: 'foo-service-apiKey'
      }
      const fooAbility = {
        name: 'foo-ability-name'
      }
      const fooData = {
        data: 'foo-data'
      }

      test.it('should call to create a new Connection, passing the service url and apiKey', () => {
        return client.sendAction(fooServiceData, fooAbility, fooData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.Connection).to.have.been.calledWith(fooServiceData.url, {
              apiKey: fooServiceData.apiKey
            })
          })
      })

      test.it('should trace data as an empty string if not received', () => {
        return client.sendAction(fooServiceData, fooAbility, {})
          .then(() => {
            return test.expect(baseMocks.stubs.service.tracer.debug.getCall(0).args[0]).to.include('Data: ""')
          })
      })

      test.it('should call to post to ability action handler, passing the data', () => {
        return client.sendAction(fooServiceData, fooAbility, fooData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.connection.post).to.have.been.calledWith('abilities/foo-ability-name/action', fooData)
          })
      })

      test.it('should convert received ServerUnavailable errors to BadGateway errors', () => {
        const fooBadGatewayError = new Error('foo error')
        const fooServerUnavailableError = new Error('server unavailable')
        fooServerUnavailableError.typeof = 'ServerUnavailable'

        baseMocks.stubs.service.errors.BadGateway.returns(fooBadGatewayError)
        baseMocks.stubs.service.client.connection.post.rejects(fooServerUnavailableError)

        return client.sendAction(fooServiceData, fooAbility, fooData)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooBadGatewayError)
          })
      })

      test.it('should reject with any other received error', () => {
        const fooError = new Error()
        baseMocks.stubs.service.client.connection.post.rejects(fooError)

        return client.sendAction(fooServiceData, fooAbility, fooData)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('getState method', () => {
      const fooServiceData = {
        url: 'foo-service-url',
        apiKey: 'foo-service-apiKey'
      }
      const fooAbility = {
        name: 'foo-ability-name'
      }

      test.beforeEach(() => {
        baseMocks.stubs.service.client.connection.get.resolves({})
      })

      test.it('should call to create a new Connection, passing the service url and apiKey', () => {
        return client.getState(fooServiceData, fooAbility)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.Connection).to.have.been.calledWith(fooServiceData.url, {
              apiKey: fooServiceData.apiKey
            })
          })
      })

      test.it('should call to get ability action handler, passing the data', () => {
        return client.getState(fooServiceData, fooAbility)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.connection.get).to.have.been.calledWith('abilities/foo-ability-name/state')
          })
      })

      test.it('should convert received ServerUnavailable errors to BadGateway errors', () => {
        const fooBadGatewayError = new Error('foo error')
        const fooServerUnavailableError = new Error('server unavailable')
        fooServerUnavailableError.typeof = 'ServerUnavailable'

        baseMocks.stubs.service.errors.BadGateway.returns(fooBadGatewayError)
        baseMocks.stubs.service.client.connection.get.rejects(fooServerUnavailableError)

        return client.getState(fooServiceData, fooAbility)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooBadGatewayError)
          })
      })

      test.it('should reject with any other received error', () => {
        const fooError = new Error()
        baseMocks.stubs.service.client.connection.get.rejects(fooError)

        return client.getState(fooServiceData, fooAbility)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('sendEvent method', () => {
      const fooServiceData = {
        url: 'foo-service-url',
        apiKey: 'foo-service-apiKey'
      }
      const fooEventData = {
        entity: 'foo-entity',
        operation: 'foo-operation',
        data: {
          _id: 'foo-event-data-id',
          foo: 'foo'
        }
      }

      test.beforeEach(() => {
        baseMocks.stubs.service.client.connection.get.resolves({})
      })

      test.it('should call to create a new Connection, passing the service url and apiKey', () => {
        return client.sendEvent(fooServiceData, fooEventData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.Connection).to.have.been.calledWith(fooServiceData.url, {
              apiKey: fooServiceData.apiKey
            })
          })
      })

      test.it('should call to post event, passing the data', () => {
        return client.sendEvent(fooServiceData, fooEventData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.connection.post).to.have.been.calledWith('events', fooEventData)
          })
      })

      test.it('should catch client error and trace it', () => {
        const fooServerUnavailableError = new Error('server unavailable')
        fooServerUnavailableError.typeof = 'ServerUnavailable'

        baseMocks.stubs.service.client.connection.post.rejects(fooServerUnavailableError)

        return client.sendEvent(fooServiceData, fooEventData)
          .then(response => {
            return test.expect(baseMocks.stubs.service.tracer.warn).to.have.been.called()
          })
      })
    })
  })
})
