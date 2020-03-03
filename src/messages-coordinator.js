
exports.startCoordination = ({ logger, mhubConnector, scoringConnector, tournamentConnector, eventManager, cloudConnector }) => {
  mhubConnector.listen('teams:reload', data => {
    if (['add', 'update'].includes(data.action)) {
      Promise.all([
        eventManager.getCurrentEvent(),
        tournamentConnector.getTeamById(data.id)
      ])
        .then(([event, team]) => cloudConnector.sendTeamMessage(event, team))
    } else if (['delete'].includes(data.action)) {
      eventManager.getCurrentEvent()
        .then(event => cloudConnector.sendTeamMessage(event, { id: data.id, deleted: true }))
    }
  })

  mhubConnector.listen('scores:reload', data => {
    if (['add', 'update'].includes(data.action)) {
      Promise.all([
        eventManager.getCurrentEvent(),
        scoringConnector.getScoreById(data.id)
      ])
        .then(([event, score]) => cloudConnector.sendScoreMessage(event, score))
    } else if (['delete'].includes(data.action)) {
      eventManager.getCurrentEvent()
        .then(event => cloudConnector.sendScoreMessage(event, { id: data.id, deleted: true }))
    }
  })

  eventManager.updateEventData()
}
