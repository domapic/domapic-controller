
const test = require('narval')

const mocks = require('./mocks')

test.describe('server', () => {
  let controllerMock
  test.before(() => {
    controllerMock = new mocks.Controller()
    require('../../server')
  })

  test.after(() => {
    controllerMock.restore()
  })

  test.it('should have called to start controller', () => {
    test.expect(controllerMock.stubs.start).to.have.been.called()
  })
})
