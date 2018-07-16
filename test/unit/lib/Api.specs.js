
const test = require('narval')
const _ = require('lodash')

const mocks = require('../mocks')

const Api = require('../../../lib/Api')

test.describe('Api', () => {
  let baseMocks
  let usersMocks
  let api

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    usersMocks = new mocks.api.Users()
    api = new Api(baseMocks.stubs.service)
  })

  test.afterEach(() => {
    baseMocks.restore()
    usersMocks.restore()
  })

  test.describe('instance', () => {
    test.describe('openapis property', () => {
      test.it('should be an array', () => {
        return test.expect(_.isArray(api.openapis)).to.be.true()
      })
    })

    test.describe('operations property', () => {
      test.it('should contain all api operations', () => {
        return test.expect(api.operations).to.have.all.keys(
          'getUsers',
          'addUser'
        )
      })
    })
  })
})
