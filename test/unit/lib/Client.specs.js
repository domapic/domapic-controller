
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
      const fooModuleData = {
        url: 'foo-module-url',
        apiKey: 'foo-module-apiKey'
      }
      const fooAbility = {
        name: 'foo-ability-name'
      }
      const fooData = {
        data: 'foo-data'
      }

      test.it('should call to create a new Connection, passing the module url and apiKey', () => {
        return client.sendAction(fooModuleData, fooAbility, fooData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.Connection).to.have.been.calledWith(fooModuleData.url, {
              apiKey: fooModuleData.apiKey
            })
          })
      })

      test.it('should call to post to ability action handler, passing the data', () => {
        return client.sendAction(fooModuleData, fooAbility, fooData)
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

        return client.sendAction(fooModuleData, fooAbility, fooData)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooBadGatewayError)
          })
      })

      test.it('should reject with any other received error', () => {
        const fooError = new Error()
        baseMocks.stubs.service.client.connection.post.rejects(fooError)

        return client.sendAction(fooModuleData, fooAbility, fooData)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })

    test.describe('getState method', () => {
      const fooModuleData = {
        url: 'foo-module-url',
        apiKey: 'foo-module-apiKey'
      }
      const fooAbility = {
        name: 'foo-ability-name'
      }

      test.beforeEach(() => {
        baseMocks.stubs.service.client.connection.get.resolves({})
      })

      test.it('should call to create a new Connection, passing the module url and apiKey', () => {
        return client.getState(fooModuleData, fooAbility)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.Connection).to.have.been.calledWith(fooModuleData.url, {
              apiKey: fooModuleData.apiKey
            })
          })
      })

      test.it('should call to get ability action handler, passing the data', () => {
        return client.getState(fooModuleData, fooAbility)
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

        return client.getState(fooModuleData, fooAbility)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooBadGatewayError)
          })
      })

      test.it('should reject with any other received error', () => {
        const fooError = new Error()
        baseMocks.stubs.service.client.connection.get.rejects(fooError)

        return client.getState(fooModuleData, fooAbility)
          .then(response => {
            return test.assert.fail()
          }, (err) => {
            return test.expect(err).to.equal(fooError)
          })
      })
    })
  })
})
