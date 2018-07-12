'use strict'

const path = require('path')

const domapic = require('domapic-base')

domapic.cli({
  script: path.resolve(__dirname, '..', 'server.js')
})
