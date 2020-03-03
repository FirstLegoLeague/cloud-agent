const Promise = require('bluebird')

const COLLECTION_NAME = 'events'

exports.EventManager = class {
  constructor ({ db: dbPromise, cloudConnector, tournamentConnector, scoringConnector }) {
    this._cloudConnector = cloudConnector
    this._tournamentConnector = tournamentConnector
    this._scoringConnector = scoringConnector
    this._collectionPromise = dbPromise
      .then(db => db.createCollection(COLLECTION_NAME))
      .tap(collection => collection.createIndexes([
        { key: { current: 1 } },
        { key: { cloudId: 1 }, unique: true }
      ]))
    this._currentEvent = null
  }

  getCurrentEvent () {
    if (this._currentEvent == null) {
      return this._collectionPromise
        .then(collection => collection.findOne({ current: true }))
        .tap(event => {
          if (event == null) {
            throw Object.assign(new Error(), { code: 'NOT_FOUND' })
          } else {
            this._currentEvent = event
          }
        })
    } else {
      return Promise.resolve(this._currentEvent)
    }
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
      .tap(() => { this._currentEvent = null })
      .then(() => this.updateEventData())
  }

  closeCurrentEvent () {
    return Promise.all([
      this.getCurrentEvent(),
      this._tournamentConnector.getTeams(),
      this._scoringConnector.getScores()
    ])
      .then(([event, teams, scores]) => this._cloudConnector.sendClosingMessage(event, teams, scores))
      .then(() => this._collectionPromise)
      .then(collection => collection.updateMany({ current: true }, { $set: { current: false } }))
      .tap(() => { this._currentEvent = null })
  }

  updateEventData () {
    const eventPromise = this.getCurrentEvent()

    Promise.all([eventPromise, this._tournamentConnector.getTeams()])
      .then(([event, teams]) => {
        return teams.map(team => this._cloudConnector.sendTeamMessage(event, team))
      })
      .all()

    Promise.all([eventPromise, this._scoringConnector.getScores()])
      .then(([event, scores]) => {
        return scores.map(score => this._cloudConnector.sendScoreMessage(event, score))
      })
      .all()
  }
}
