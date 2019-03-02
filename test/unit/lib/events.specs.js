
const test = require('narval')

const events = require('../../../lib/events')

test.describe('events', () => {
  let sandbox

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox()
    sandbox.stub(events.emitter, 'emit')
  })

  test.afterEach(() => {
    sandbox.restore()
  })

  test.describe('plugin method', () => {
    test.it('should emit a plugin event, passing entity, operation and data', () => {
      const fooEntity = 'foo-entity'
      const fooOperation = 'foo-operation'
      const fooData = {
        foo: 'foo'
      }
      events.plugin(fooEntity, fooOperation, fooData)
      return test.expect(events.emitter.emit).to.have.been.calledWith('plugin', {
        entity: fooEntity,
        operation: fooOperation,
        data: fooData
      })
    })
  })

  test.describe('socket method', () => {
    test.it('should emit a socket event, passing entity, operation, data and roles', () => {
      const fooEntity = 'foo-entity'
      const fooOperation = 'foo-operation'
      const fooData = {
        foo: 'foo'
      }
      const fooRoles = ['foo', 'foo2']
      events.socket(fooEntity, fooOperation, fooData, fooRoles)
      return test.expect(events.emitter.emit).to.have.been.calledWith('socket', {
        entity: fooEntity,
        operation: fooOperation,
        data: fooData,
        roles: fooRoles
      })
    })
  })

  test.describe('all method', () => {
    test.it('should emit plugin and socket events', () => {
      const fooEntity = 'foo-entity'
      const fooOperation = 'foo-operation'
      const fooData = {
        foo: 'foo'
      }
      const fooRoles = ['foo', 'foo2']
      events.all(fooEntity, fooOperation, fooData, fooRoles)
      return Promise.all([
        test.expect(events.emitter.emit).to.have.been.calledWith('socket', {
          entity: fooEntity,
          operation: fooOperation,
          data: fooData,
          roles: fooRoles
        }),
        test.expect(events.emitter.emit).to.have.been.calledWith('plugin', {
          entity: fooEntity,
          operation: fooOperation,
          data: fooData
        })
      ])
    })
  })
})
