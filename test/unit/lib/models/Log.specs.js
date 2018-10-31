const test = require('narval')

const mocks = require('../../mocks')

const log = require('../../../../lib/models/log')

test.describe('log model', () => {
  test.describe('Model instance', () => {
    let model
    let mongooseMocks
    let baseMocks

    test.beforeEach(() => {
      baseMocks = new mocks.Base()
      mongooseMocks = new mocks.Mongoose()
    })

    test.afterEach(() => {
      baseMocks.restore()
      mongooseMocks.restore()
    })

    test.it('should create a mongoose model', () => {
      model = log.Model(baseMocks.stubs.service)
      test.expect(mongooseMocks.stubs.model).to.have.been.called()
    })
  })
})
