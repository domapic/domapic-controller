'use strict'

const roles = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  MODULE: 'module',
  SERVICE_REGISTERER: 'service-registerer',
  PLUGIN: 'plugin',
  ANONYMOUS: 'anonymous'
}

const INITIAL_ADMIN_USER = {
  name: roles.ADMIN,
  email: `${roles.ADMIN}@${roles.ADMIN}.com`,
  password: roles.ADMIN,
  role: roles.ADMIN
}

const SERVICE_REGISTERER_USER = {
  name: roles.SERVICE_REGISTERER,
  role: roles.SERVICE_REGISTERER
}

const ANONYMOUS_USER = {
  name: 'anonymous',
  role: roles.ANONYMOUS
}

const API_KEY = 'apiKey'
const JWT = 'jwt'

let anonymousUserPromise

const cleanUserData = userData => ({
  _id: userData._id.toString(),
  name: userData.name,
  email: userData.email,
  role: userData.role
})

const GetUserBySecurityToken = commands => securityToken => commands.securityToken.getUser(securityToken)
  .then(userData => {
    if (userData.adminPermissions) {
      userData.role = roles.ADMIN
    }
    return Promise.resolve(cleanUserData(userData))
  })

const GetAnonymousUser = commands => () => {
  if (anonymousUserPromise) {
    return anonymousUserPromise
  }
  anonymousUserPromise = commands.user.get({
    name: ANONYMOUS_USER.name
  }).then(userData => Promise.resolve(cleanUserData(userData)))
  return anonymousUserPromise
}

const AdminOrOwner = getOwner => (userData, params, body) => {
  if (userData.role === roles.ADMIN) {
    return true
  }
  return getOwner(userData, params, body)
    .then(resourceUserData => {
      return resourceUserData._id.toString() === userData._id ? Promise.resolve() : Promise.reject(new Error())
    })
}

const onlyAdmin = userData => userData.role === roles.ADMIN

module.exports = {
  roles,
  INITIAL_ADMIN_USER,
  SERVICE_REGISTERER_USER,
  ANONYMOUS_USER,
  API_KEY,
  JWT,
  cleanUserData,
  GetUserBySecurityToken,
  GetAnonymousUser,
  AdminOrOwner,
  onlyAdmin
}
