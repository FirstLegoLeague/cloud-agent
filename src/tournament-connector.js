const axios = require('axios')

exports.TournamentConnector = class {
  constructor ({ logger, config }) {
    this._logger = logger
    this._tournamentUrl = config.tournamentUrl
  }

  getTeams () {
    return axios.get(`${this._tournamentUrl}/team/all`)
      .then(response => {
        return response.data
      })
  }

  getTeamById (id) {
    return axios.get(`${this._tournamentUrl}/team/${id}`)
      .then(response => {
        return response.data
      })
  }
}
