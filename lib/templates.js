'use strict'

const domapic = require('domapic-base')

const templates = {
  connectingDb: 'Connecting with database "{{db}}"'
}

module.exports = domapic.utils.templates.compile(templates)
