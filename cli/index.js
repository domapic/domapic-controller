'use strict'

const path = require('path')

const domapic = require('domapic-base')
const options = require('../lib/options')

domapic.cli({
  script: path.resolve(__dirname, '..', 'server.js'),
  customConfig: options
})
