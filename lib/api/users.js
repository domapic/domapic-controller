'use strict'

const definition = require('./users.json')

const Operations = (service, commands) => ({
  getUsers: {
    handler: () => commands.user.getAll()
  },
  addUser: {
    handler: (params, body, res) => commands.user.add(body)
      .then((user) => {
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
