
const test = require('narval')

const mocks = require('../mocks')

const Commands = require('../../../lib/Commands')

test.describe('Commands', () => {
  let baseMocks
  let modelsMocks
  let clientMocks
  let userCommandsMocks
  let commands

  test.beforeEach(() => {
    baseMocks = new mocks.Base()
    modelsMocks = new mocks.Models()
    clientMocks = new mocks.Client()
    userCommandsMocks = new mocks.commands.User()
    commands = new Commands(baseMocks.stubs.service, modelsMocks.stubs, clientMocks.stubs)
  })

  test.afterEach(() => {
    baseMocks.restore()
    modelsMocks.restore()
    clientMocks.restore()
    userCommandsMocks.restore()
  })

  test.describe('instance', () => {
    test.it('should contain user commands', () => {
      return test.expect(commands.user).to.have.all.keys(
        'add',
        'getAll'
      )
    })
  })
})
