const Promise = require('bluebird')
const fastify = require('fastify')
const { MongoClient } = require('mongodb')
const { Logger } = require('@first-lego-league/ms-logger')

const { CloudConnector } = require('./cloud-connector')
const { EventManager } = require('./event-manager')
const messagesCoordinator = require('./messages-coordinator')
const { MhubConnector } = require('./mhub-connector')
const routes = require('./routes')
const { ScoringConnector } = require('./scoring-connector')
const { TournamentConnector } = require('./tournament-connector')

const options = {
  logger: new Logger(),
  config: {
    tournamentUrl: process.env.MODULE_TOURNAMENT_URL,
    scoringUrl: process.env.MODULE_SCORING_URL,
    mhubUri: process.env.MHUB_URI,
    mhubPassword: process.env.PROTECTED_MHUB_PASSWORD
  }
}

const mongoUri = process.env.MONGO_URI
const mongoPromise = MongoClient.connect(mongoUri, {
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
options.db = mongoPromise.then(client => client.db())

options.cloudConnector = new CloudConnector(options)
options.mhubConnector = new MhubConnector(options)
options.tournamentConnector = new TournamentConnector(options)
options.scoringConnector = new ScoringConnector(options)

options.eventManager = new EventManager(options)

const app = options.app = fastify()

routes.configure(options)
messagesCoordinator.startCoordination(options)

app.listen(process.env.PORT, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
