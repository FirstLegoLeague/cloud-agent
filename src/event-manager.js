const Promise = require('bluebird')

const COLLECTION_NAME = 'events'

exports.EventManager = class {
  constructor ({ db: dbPromise, cloudConnector }) {
    this._cloudConnector = cloudConnector
    this._collectionPromise = dbPromise
      .then(db => db.createCollection(COLLECTION_NAME))
      .tap(collection => collection.createIndexes([
        { key: { current: 1 } },
        { key: { cloudId: 1 }, unique: true }
      ]))
  }

  getCurrentEvent () {
    return this._collectionPromise
      .then(collection => collection.findOne({ current: true }))
      .then(event => {
        if (event == null) {
          throw Object.assign(new Error(), { code: 'NOT_FOUND' })
        } else {
          return event
        }
      })
  }

  setCurrentEvent (eventId, token) {
    return Promise.all([
      this._collectionPromise,
      this._cloudConnector.getEventInfo(eventId)
    ])
      .then(([collection, cloudEventInfo]) => {
        return collection.updateOne(
          { cloudId: cloudEventInfo._id },
          {
            $set: {
              cloudId: cloudEventInfo._id,
              name: cloudEventInfo.name,
              startTime: cloudEventInfo.startTime,
              endTime: cloudEventInfo.endTime,
              city: cloudEventInfo.city,
              region: cloudEventInfo.region,
              country: cloudEventInfo.country,
              token: token,
              current: true
            }
          },
          { upsert: true }
        )
      })
  }

  closeCurrentEvent () {
    return this._collectionPromise
      .then(collection => collection.updateMany({ current: true }, { $set: { current: false } }))
  }
}
