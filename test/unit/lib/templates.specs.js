
const _ = require('lodash')
const test = require('narval')

const templates = require('../../../lib/templates')

test.describe('templates', () => {
  test.it('should export template functions', () => {
    _.each(templates, (template) => {
      test.expect(typeof template).to.equal('function')
    })
  })
})
