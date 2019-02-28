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

  console.log('socket initialized!!')

  socketIoAuth(io, {
    authenticate: (socket, data, callback) => {
      console.log('Authenticating socket')
      getUserBySecurityToken(data.jwt || data.apiKey)
        .then(userData => {
          socket.userData = {
            _id: 'foo-id',
            name: 'foo-name'
          }
          console.log('Authenticated socket')
          service.tracer.info(templates.socketAuth({
            user: userData,
            id: socket.id
          }))
          authenticatedSockets[socket.id] = socket
          callback(null, true)
        })
        .catch(err => {
          console.log('Authentication error')
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
    console.log('Socket connected')
    service.tracer.trace(templates.socketConnected({
      id: socket.id
    }))
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      service.tracer.trace(templates.socketDisconnected({
        id: socket.id
      }))
      if (socket.auth) {
        console.log('Socket auth disconnected')
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
