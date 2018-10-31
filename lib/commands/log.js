'use strict'

const Commands = (service, models, client) => {
  const add = logData => {
    const newLog = new models.Log(logData)
    return newLog.save()
      .then(() => Promise.resolve(newLog))
  }

  return {
    add
  }
}

module.exports = {
  Commands
}
