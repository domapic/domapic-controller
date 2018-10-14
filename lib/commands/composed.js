'use strict'

const templates = require('../templates')
const { SERVICE_REGISTERER_USER, API_KEY } = require('../security/utils')

const Commands = (service, models, client, commands) => {
  const initUsers = () => commands.user.init()
    .then(addedUsers => addedUsers ? commands.securityToken.add(addedUsers[1], API_KEY) : Promise.resolve())
    .then(() => commands.user.get(SERVICE_REGISTERER_USER)
      .catch(() => commands.user.add(SERVICE_REGISTERER_USER)))
    .then(serviceRegistererUser => commands.securityToken.get({
      _user: serviceRegistererUser._id,
      type: API_KEY
    }).catch(() => commands.securityToken.add(serviceRegistererUser, API_KEY)))
    .then(serviceRegistererApiKey => service.tracer.info(templates.serviceRegistererApiKey(serviceRegistererApiKey)))

  const dispatchAbilityAction = (abilityId, data) => commands.ability.validateAction(abilityId, data)
    .then(ability => commands.service.getById(ability._service, {
      allFields: true
    }).then(service => client.sendAction(service, ability, data))
    )

  return {
    initUsers,
    dispatchAbilityAction
  }
}

module.exports = {
  Commands
}