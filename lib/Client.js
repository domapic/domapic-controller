'use strict'

const Client = service => {
  const sendAction = (service, ability, data) => {
    console.log('------------------------- service')
    console.log(service)
    console.log('------------------------- ability')
    console.log(ability)
    console.log('------------------------- data')
    console.log(data)
    return Promise.resolve()
  }

  return {
    sendAction
  }
}

module.exports = Client
