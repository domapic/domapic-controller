'use strict'

const path = require('path')
const fs = require('fs')

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

module.exports = {
  waitOnestimatedStartTime: waitOnestimatedStartTime,
  readOutErr: new ReadLogs()
}
