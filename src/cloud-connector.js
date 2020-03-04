const _ = require('lodash')
const axios = require('axios')

exports.CloudConnector = class {
  constructor ({ logger, config }) {
    this._logger = logger
    this._cloudUrl = config.cloudUrl
  }

  getEventInfo (eventId, token) {
    return axios.get(`${this._cloudUrl}/api/agent/event/${eventId}`, {
      headers: { 'X-Auth-Token': token }
    })
      .then(response => {
        return response.data
      })
  }

  _sendEventMessage (event, type, body) {
    return axios.post(`${this._cloudUrl}/api/agent/event/${event.cloudId}/message`, {
      timestamp: Date.now(),
      type,
      body
    }, {
      headers: { 'X-Auth-Token': event.token }
    })
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
