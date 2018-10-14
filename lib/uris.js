'use strict'

const { kebabCase } = require('lodash')

// Services
const ABILITIES = 'abilities'
const STATE_HANDLER_PATH = 'state'
const ACTION_HANDLER_PATH = 'action'

const normalizeName = name => kebabCase(name)

const resolveUri = function () {
  return Array.prototype.slice.call(arguments).join('/')
}

// Services
const abilityStateHandler = name => resolveUri(ABILITIES, normalizeName(name), STATE_HANDLER_PATH)
const abilityActionHandler = name => resolveUri(ABILITIES, normalizeName(name), ACTION_HANDLER_PATH)

module.exports = {
  abilityStateHandler,
  abilityActionHandler
}
