
const test = require('narval')

const mongoose = require('mongoose')

const Mock = function () {
  const sandbox = test.sinon.createSandbox()

  const returnsSchema = (schemaData) => schemaData

  const returnsModelSchema = (modelName, modelSchema) => modelSchema

  const stubs = {
    connect: sandbox.stub(mongoose, 'connect').usingPromise().resolves(),
    Schema: sandbox.stub(mongoose, 'Schema').callsFake(returnsSchema),
    model: sandbox.stub(mongoose, 'model').callsFake(returnsModelSchema)
  }

  const restore = function () {
    sandbox.restore()
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
