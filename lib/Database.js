'use strict'

const Promise = require('bluebird')
const mongoose = require('mongoose')

const templates = require('./templates')

const CONNECTION_OPTIONS = {
  keepAlive: 120,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500,
  useNewUrlParser: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000
}

const Database = function (service) {
  const connectMongoose = function (db) {
    mongoose.Promise = Promise
    return mongoose.connect(db, CONNECTION_OPTIONS)
  }

  const connect = function () {
    return service.config.get('db')
      .then(db => service.tracer.info(templates.connectingDb({db}))
        .then(() => connectMongoose(db))
        .then(() => service.tracer.info(templates.connectedDb({db})))
      )
  }

  return {
    connect
  }
}

module.exports = Database
