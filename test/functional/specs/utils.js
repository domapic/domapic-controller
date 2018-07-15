'use strict'

const path = require('path')
const fs = require('fs')

const requestPromise = require('request-promise')

const SERVICE_HOST = process.env.controller_host_name
const SERVICE_PORT = '3000'
const DOMAPIC_PATH = process.env.domapic_path
const ESTIMATED_START_TIME = 1000

const readFile = function (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const ReadLogs = function (fileName = 'combined-outerr') {
  return function (serviceName = 'controller') {
    return readFile(path.resolve(__dirname, '..', '..', '..', '.narval', 'logs', process.env.narval_suite_type, process.env.narval_suite, serviceName, `${fileName}.log`))
  }
}

const waitOnestimatedStartTime = function (time = ESTIMATED_START_TIME) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const request = function (uri, options = {}) {
  const defaultOptions = {
    uri: `http://${SERVICE_HOST}:${SERVICE_PORT}/api${uri}`,
    json: true,
    strictSSL: false,
    rejectUnauthorized: false,
    simple: false,
    requestCert: false,
    resolveWithFullResponse: true
  }
  return requestPromise(Object.assign(defaultOptions, options))
}

const readStorage = function (folder = 'storage', file = 'service.json') {
  return readFile(path.resolve(__dirname, '..', '..', '..', DOMAPIC_PATH, '.domapic', 'controller', folder, file))
    .then((data) => {
      return Promise.resolve(JSON.parse(data))
    })
}

module.exports = {
  waitOnestimatedStartTime: waitOnestimatedStartTime,
  readOutErr: new ReadLogs(),
  request: request,
  readStorage: readStorage
}
