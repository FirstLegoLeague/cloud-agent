const Promise = require('bluebird')
const _ = require('lodash')

exports.CloudConnector = class {
  constructor ({ logger }) {
    this._logger = logger
  }

  getEventInfo (eventId) {
    if (eventId === '5d8b0b4551a48b135ec4b4a5') {
      return Promise.resolve({
        _id: '5d8b0b4551a48b135ec4b4a5',
        name: 'Event 1',
        startTime: new Date().toString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toString(),
        city: 'Tel-Aviv',
        region: 'Israel',
        country: 'Israel'
      })
    } else {
      return Promise.reject(Object.assign(new Error(), { code: 'NOT_FOUND' }))
    }
  }

  _sendEventMessage (event, type, body) {
    if (event.token.endsWith('gqru4-65GOaqtUiDrCe3bP5Cr74VeD_JCBOxccB3pFI')) {
      this._logger.info(`Sending ${type} message: ${JSON.stringify(body)}`)
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Unauthorized Cloud Access'))
    }
  }

  sendClosingMessage (event, teams, scores) {
    return this._sendEventMessage(event, 'closing', { teams, scores })
  }

  sendScoreMessage (event, score) {
    return this._sendEventMessage(event, 'score',
      _.pick(score, ['teamNumber', 'stage', 'round', 'score', 'published']))
  }

  sendTeamMessage (event, team) {
    return this._sendEventMessage(event, 'team',
      _.pick(team, ['number', 'name', 'affiliation', 'cityState', 'country']))
  }
}
