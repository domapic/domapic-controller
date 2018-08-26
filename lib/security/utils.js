'use strict'

const cleanUserData = userData => ({
  _id: userData._id,
  name: userData.name,
  email: userData.email,
  role: userData.role
})

const GetUserBySecurityToken = commands => securityToken => commands.securityToken.getUser(securityToken)
  .then(userData => Promise.resolve(cleanUserData(userData)))

const AuthOperation = getOwner => (userData, params, body) => {
  if (userData.role === 'admin') {
    return true
  }
  return getOwner(userData, params, body)
    .then(resourceUserData => {
      return resourceUserData.email === userData.email ? Promise.resolve() : Promise.reject(new Error())
    })
}

module.exports = {
  cleanUserData,
  GetUserBySecurityToken,
  AuthOperation
}
