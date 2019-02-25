'use strict'

const PUBLIC_FIELDS = '_ability type data createdAt'

const PAGE_SIZE = 10;

const Commands = (service, models, client) => {
  const add = logData => {
    const newLog = new models.Log(logData)
    return newLog.save()
      .then(() => Promise.resolve(newLog))
  }

  const getAll = (filter = {}) => models.Log.find(filter, PUBLIC_FIELDS).sort([["createdAt", -1]])

  const getPaginated = (page, filter = {}) => models.Log.find(filter, PUBLIC_FIELDS, {
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE
  }).sort([["createdAt", -1]])

  const getStats = filter => {
    const countPromise = filter ? models.Log.countDocuments(filter) : Promise.resolve(models.Log.estimatedDocumentCount());
    return  countPromise.then(total => ({
      total
    }))
  }

  return {
    add,
    getAll,
    getPaginated,
    getStats
  }
}

module.exports = {
  Commands
}
