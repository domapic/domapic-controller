
const path = require('path')

const test = require('narval')

const mocks = require('../mocks')

test.describe('cli index', () => {
  let baseMock
  test.before(() => {
    baseMock = new mocks.Base()
    require('../../../cli/index')
  })

  test.after(() => {
    baseMock.restore()
  })

  test.it('should called to create a cli from domapic base', () => {
    test.expect(baseMock.stubs.cli).to.have.been.called()
  })

  test.it('should have passed the server script path when created the cli', () => {
    test.expect(baseMock.stubs.cli).to.have.been.calledWith({
      script: path.resolve(__dirname, '..', '..', '..', 'server.js')
    })
  })
})
