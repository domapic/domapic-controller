'use strict'

const { forEach } = require('lodash')
const socketIo = require('socket.io')
const socketIoAuth = require('socketio-auth')

const templates = require('./templates')
const events = require('./events')
const securityUtils = require('./security/utils')

const init = (server, service, commands) => {
  const getUserBySecurityToken = securityUtils.GetUserBySecurityToken(commands)
  const io = socketIo(server)
  const authenticatedSockets = {}

  socketIoAuth(io, {
    authenticate: (socket, data, callback) => {
      getUserBySecurityToken(data.jwt || data.apiKey)
        .then(userData => {
          socket.userData = {
            _id: 'foo-id',
            name: 'foo-name'
          }
          service.tracer.info(templates.socketAuth({
            user: userData,
            id: socket.id
          }))
          authenticatedSockets[socket.id] = socket
          callback(null, true)
        })
        .catch(err => {
          service.tracer.error(templates.socketAuthError({id: socket.id}))
          callback(err, false)
        })
    }
  })

  events.emitter.on(events.SOCKET, eventData => {
    forEach(authenticatedSockets, socket => {
      if (!eventData.roles || eventData.roles.includes(socket.userData.role)) {
        socket.emit(`${eventData.entity}:${eventData.operation}`, eventData.data)
      }
    })
  })

  io.on('connection', function (socket) {
    service.tracer.trace(templates.socketConnected({
      id: socket.id
    }))
    socket.on('disconnect', () => {
      service.tracer.trace(templates.socketDisconnected({
        id: socket.id
      }))
      if (socket.auth) {
        delete authenticatedSockets[socket.id]
        service.tracer.info(templates.socketAuthDisconnected({
          user: socket.userData,
          id: socket.id
        }))
      }
    })
  })

  return Promise.resolve()
}

module.exports = {
  init
}
