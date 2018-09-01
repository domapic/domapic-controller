'use strict'

module.exports = {
  db: {
    type: 'string',
    alias: ['mongodb', 'mongo', 'dbconnection'],
    describe: 'Mongodb connection uri',
    default: 'mongodb://localhost:27017/domapic',
    demandOption: true
  },
  secret: {
    type: 'string',
    alias: ['auth-secret'],
    describe: 'Secret to be used in authentication encoding'
  }
}
