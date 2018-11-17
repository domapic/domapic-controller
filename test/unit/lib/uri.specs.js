
const test = require('narval')

const uris = require('../../../lib/uris')

test.describe('uri utils', () => {
  test.describe('abilityActionHandler method', () => {
    test.it('should return the ability action uri, transforming the provided name into kebabCase', () => {
      test.expect(uris.abilityActionHandler('fooName')).to.equal('abilities/foo-name/action')
    })
  })

  test.describe('abilityStateHandler method', () => {
    test.it('should return the ability state uri, transforming the provided name into kebabCase', () => {
      test.expect(uris.abilityStateHandler('foo_name')).to.equal('abilities/foo-name/state')
    })
  })

  test.describe('serviceEventHandler method', () => {
    test.it('should return the event uri', () => {
      test.expect(uris.serviceEventHandler()).to.equal('events')
    })
  })
})
