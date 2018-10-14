
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

      test.it('should call to post to ability action handler, passing the data', () => {
        return client.sendAction(fooServiceData, fooAbility, fooData)
          .then(() => {
            return test.expect(baseMocks.stubs.service.client.connection.post).to.have.been.calledWith('abilities/foo-ability-name/action', fooData)
          })
      })
    })
  })
})
