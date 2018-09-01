'use strict'

const path = require('path')
const fs = require('fs')

const requestPromise = require('request-promise')

const SERVICE_HOST = process.env.controller_host_name
const SERVICE_PORT = '3000'
const DOMAPIC_PATH = process.env.domapic_path
const ESTIMATED_START_TIME = 1000

const superAdmin = {
  name: 'super admin',
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
    user: userData.email,
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
    .then(() => createUser(authenticator, userData).finally(() => doLogin(authenticator, {
      name: userData.name,
      email: userData.email,
      password: userData.password
    })))
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
  ensureUserAndDoLogin
}
