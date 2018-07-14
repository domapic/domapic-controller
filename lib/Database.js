'use strict'

const templates = require('./templates')

const Database = function (service) {
  const connect = function () {
    return service.config.get('db')
      .then(db => service.tracer.info(templates.connectingDb({db})))
  }

  return {
    connect
  }
}

module.exports = Database
