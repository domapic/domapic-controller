'use strict'

const roles = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  SERVICE: 'service',
  SERVICE_REGISTERER: 'service-registerer',
  PLUGIN: 'plugin'
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

const API_KEY = 'apiKey'
const JWT = 'jwt'

const cleanUserData = userData => ({
  _id: userData._id.toString(),
  name: userData.name,
  email: userData.email,
  role: userData.role
})

const GetUserBySecurityToken = commands => securityToken => commands.securityToken.getUser(securityToken)
  .then(userData => Promise.resolve(cleanUserData(userData)))

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
  API_KEY,
  JWT,
  cleanUserData,
  GetUserBySecurityToken,
  AdminOrOwner,
  onlyAdmin
}
