'use strict'

const path = require('path')

const domapic = require('domapic-base')
const options = require('../lib/options')
const user = require('./commands/user')

module.exports = domapic.cli({
  packagePath: path.resolve(__dirname, '..'),
  script: path.resolve(__dirname, '..', 'server.js'),
  customConfig: options,
  customCommands: {
    user
  }
}).catch(err => {
  process.exitCode = 1
  if (!err.isDomapic) {
    console.error(err)
  }
})
