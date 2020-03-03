const axios = require('axios')

exports.ScoringConnector = class {
  constructor ({ logger, config }) {
    this._logger = logger
    this._scoringUrl = config.scoringUrl
  }

  getScores () {
    return axios.get(`${this._scoringUrl}/scores/public`)
      .then(response => {
        return response.data
      })
  }

  getScoreById (id) {
    return axios.get(`${this._scoringUrl}/scores/${id}`)
      .then(response => {
        return response.data
      })
  }
}
