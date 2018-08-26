
const test = require('narval')

const mocks = require('../../mocks')

// const Security = require('../../../../lib/security/apiKey')

test.describe('apiKey security', () => {
  let baseMocks
  let commandsMocks
  // let security

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    commandsMocks = new mocks.Commands()
    // security = Security.Methods(baseMocks.stubs.service, commandsMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    commandsMocks.restore()
  })

  test.describe('Methods', () => {
    test.describe('verify handler', () => {
    })
  })
})
