'use strict'

const PUBLIC_FIELDS = '_ability type data createdAt'

const Commands = (service, models, client) => {
  const add = logData => {
    const newLog = new models.Log(logData)
    return newLog.save()
      .then(() => Promise.resolve(newLog))
  }

  //const getAll = () => models.Log.find({}, PUBLIC_FIELDS)

  const getAll = () => models.Log.find({}, PUBLIC_FIELDS, { skip:20, limit: 5 })

  return {
    add,
    getAll
  }
}

module.exports = {
  Commands
}
