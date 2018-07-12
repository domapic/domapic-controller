
const test = require('narval')

const mocks = require('./mocks')

test.describe('server', () => {
  let baseMock
  test.before(() => {
    baseMock = new mocks.Base()
    require('../../server')
  })

  test.after(() => {
    baseMock.restore()
  })

  test.it('should have created a new Service instance', () => {
    test.expect(baseMock.stubs.Service).to.have.been.called()
  })

  test.it('should have called to start the server', () => {
    test.expect(baseMock.stubs.service.server.start).to.have.been.called()
  })
})
