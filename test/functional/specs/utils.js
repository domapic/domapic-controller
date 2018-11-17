'use strict'

const path = require('path')
const fs = require('fs')
const querystring = require('querystring')
const test = require('narval')
const testUtils = require('narval/utils')

const { omitBy, isUndefined } = require('lodash')
const requestPromise = require('request-promise')

const SERVICE_HOST = process.env.controller_host_name
const SERVICE_PORT = '3000'
const DOMAPIC_PATH = process.env.domapic_path
const ESTIMATED_START_TIME = 1000
const SERVICE_NAME = 'domapic-controller'

const superAdmin = {
  name: 'admin',
  email: 'admin@admin.com',
  role: 'admin',
  password: 'admin'
}

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

const waitOnestimatedStartTime = function (time = ESTIMATED_START_TIME) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const request = function (uri, options = {}) {
  let url = `http://${SERVICE_HOST}:${SERVICE_PORT}/api${uri}`
  if (options.query) {
    url = `${url}?${querystring.stringify(omitBy(options.query, isUndefined))}`
  }
  const defaultOptions = {
    uri: url,
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
  return readFile(path.resolve(__dirname, '..', '..', '..', DOMAPIC_PATH, '.domapic', SERVICE_NAME, folder, file))
    .then((data) => {
      return Promise.resolve(JSON.parse(data))
    })
}

const Authenticator = () => {
  let name = null
  let accessToken = null
  let refreshToken = null
  let apiKey = null

  const credentials = () => {
    let headers
    if (accessToken) {
      headers = {
        authorization: `Bearer ${accessToken}`
      }
    } else if (apiKey) {
      headers = {
        'X-Api-Key': apiKey
      }
    }
    if (headers) {
      return { headers }
    }
    return {}
  }

  const login = (userName, token, refresh) => {
    name = userName
    accessToken = token
    refreshToken = refresh
    apiKey = null
  }

  const loginApiKey = (userName, key) => {
    name = userName
    accessToken = null
    refreshToken = null
    apiKey = key
  }

  const logout = () => {
    name = null
    accessToken = null
    refreshToken = null
    apiKey = null
  }

  const current = () => ({
    name,
    accessToken,
    refreshToken,
    apiKey
  })

  return {
    credentials,
    current,
    login,
    loginApiKey,
    logout
  }
}

const getAccessToken = (authenticator, userData) => {
  return request('/auth/jwt', {
    method: 'POST',
    body: userData,
    ...authenticator.credentials()
  })
}

const doLogin = (authenticator, userData = superAdmin) => {
  return getAccessToken(authenticator, {
    user: userData.name,
    password: userData.password
  }).then((response) => {
    authenticator.login(userData.name, response.body.accessToken, response.body.refreshToken)
    return Promise.resolve(response)
  })
}

const createUser = (authenticator, userData) => {
  return request('/users', {
    method: 'POST',
    body: userData,
    ...authenticator.credentials()
  })
}

const ensureUser = (authenticator, userData) => {
  return doLogin(authenticator)
    .then(() => createUser(authenticator, userData)
      .finally(() => Promise.resolve())
    )
}

const ensureUserAndDoLogin = (authenticator, userData) => {
  return ensureUser(authenticator, userData)
    .then(() => doLogin(authenticator, {
      name: userData.name,
      password: userData.password
    }))
}

const readLogs = () => testUtils.logs.combined('controller')

const addPlugin = () => {
  const authenticator = Authenticator()
  return ensureUserAndDoLogin(authenticator, {
    name: 'foo-events-plugin',
    role: 'plugin',
    email: 'events-plugin@foo.com',
    password: 'foo'
  }).then(() => {
    return request('/services', {
      method: 'POST',
      body: {
        processId: 'foo-plugin-service-id',
        description: 'foo-plugin-description',
        package: 'foo-plugin-package',
        version: '1.0.0',
        apiKey: 'dasdasdqe342312reww4r4234wgsdfsf',
        url: 'https://192.132.112.1:3500',
        type: 'plugin'
      },
      ...authenticator.credentials()
    }).then(response => {
      return Promise.resolve(response.headers.location.split('/').pop())
    })
  })
}

const expectEvent = (event, entityId, pluginId) => {
  return waitOnestimatedStartTime(200)
    .then(() => {
      return readLogs()
        .then(logs => {
          return test.expect(logs).to.contain(`Sending "${event}" event of entity "${entityId}" to plugin "${pluginId}"`)
        })
    })
}

module.exports = {
  superAdmin,
  waitOnestimatedStartTime,
  request,
  readStorage,
  Authenticator,
  getAccessToken,
  doLogin,
  createUser,
  ensureUser,
  ensureUserAndDoLogin,
  readLogs,
  addPlugin,
  expectEvent
}
