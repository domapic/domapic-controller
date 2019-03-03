'use strict'

const { forEach } = require('lodash')

const libs = require('./libs')
const templates = require('./templates')
const events = require('./events')
const securityUtils = require('./security/utils')

const init = (server, service, commands) => {
  return service.config.get()
    .then(serviceConfig => {
      const getUserBySecurityToken = securityUtils.GetUserBySecurityToken(commands)
      const getAnonymousUser = securityUtils.GetAnonymousUser(commands)
      const io = libs.socketIo(server)
      const authenticatedSockets = {}

      libs.socketIoAuth(io, {
        authenticate: (socket, data, callback) => {
          const authUser = userData => {
            socket.userData = userData
            service.tracer.info(templates.socketAuth({
              user: userData,
              id: socket.id
            }))
            authenticatedSockets[socket.id] = socket
            callback(null, true)
          }

          const authError = error => {
            service.tracer.error(templates.socketAuthError({id: socket.id}))
            callback(error, false)
          }

          if (!serviceConfig.auth) {
            callback(null, true)
          } else if (libs.ipRangeCheck(socket.handshake.address, serviceConfig.authDisabled)) {
            getAnonymousUser()
              .then(authUser)
              .catch(authError)
          } else {
            getUserBySecurityToken(data.jwt || data.apiKey)
              .then(authUser)
              .catch(authError)
          }
        }
      })

      events.emitter.on(events.SOCKET, eventData => {
        forEach(authenticatedSockets, socket => {
          if (!eventData.roles || eventData.roles.includes(socket.userData.role)) {
            socket.emit(`${eventData.entity}:${eventData.operation}`, eventData.data)
          }
        })
      })

      io.on('connection', socket => {
        service.tracer.info(templates.socketConnected({
          id: socket.id
        }))
        socket.on('disconnect', () => {
          service.tracer.info(templates.socketDisconnected({
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
    })
}

module.exports = {
  init
}
