'use strict'

const definition = require('./users.json')
const { onlyAdmin, roles } = require('../security/utils')

const Operations = (service, commands) => ({
  getUsers: {
    auth: onlyAdmin,
    handler: () => commands.user.getAll()
  },
  addUser: {
    auth: userData => [roles.ADMIN, roles.SERVICE_REGISTERER].includes(userData.role),
    handler: (params, body, res) => commands.user.add(body)
      .then(user => {
        res.status(201)
        res.header('location', `/api/users/${user._id}`)
        return Promise.resolve()
      })
  }
})

const openapi = () => [definition]

module.exports = {
  Operations,
  openapi
}
