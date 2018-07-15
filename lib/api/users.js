'use strict'

const definition = require('./users.json')

const Operations = function (service, commands) {
  return {
    getUsers: {
      handler: () => {
        return commands.user.getAll()
      }
    },
    addUser: {
      handler: (params, body, res) => {
        return commands.user.add(body)
          .then((user) => {
            res.status(201)
            res.header('location', `/api/users/${user._id}`)
            return Promise.resolve()
          })
      }
    }
  }
}

const openapi = function () {
  return [definition]
}

module.exports = {
  Operations,
  openapi
}
