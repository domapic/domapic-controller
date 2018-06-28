
const test = require('narval')

const server = require('../../server')

test.describe('server', () => {
  test.it('should exists', () => {
    test.expect(server).to.not.be.undefined()
  })
})
