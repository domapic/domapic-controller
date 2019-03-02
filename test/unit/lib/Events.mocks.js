
const test = require('narval')

const events = require('../../../lib/events')

const CallBackRunnerFake = function (options = {}) {
  let cbs = []
  const fake = function (eventName, cb) {
    if (options.runOnRegister) {
      cb(options.returns)
    }
    cbs.push(cb)
  }

  const returns = function (code) {
    options.returns = code
  }

  const runOnRegister = function (run) {
    options.runOnRegister = run
  }

  const run = function (data) {
    cbs.map(cb => cb(data))
  }

  return {
    fake: fake,
    returns: returns,
    runOnRegister: runOnRegister,
    run: run
  }
}

const Mock = function () {
  const sandbox = test.sinon.createSandbox()
  const originalEmitter = events.emitter

  const emmiterOnFake = new CallBackRunnerFake({
    runOnRegister: true
  })

  const emitterStubs = {
    on: sandbox.stub().callsFake(emmiterOnFake.fake)
  }

  emitterStubs.on.returns = emmiterOnFake.returns

  events.emitter = emitterStubs

  const stubs = {
    emitter: emitterStubs,
    plugin: sandbox.stub(events, 'plugin'),
    socket: sandbox.stub(events, 'socket'),
    all: sandbox.stub(events, 'all')
  }

  const restore = function () {
    sandbox.restore()
    events.emitter = originalEmitter
  }

  return {
    stubs: stubs,
    restore: restore
  }
}

module.exports = Mock
