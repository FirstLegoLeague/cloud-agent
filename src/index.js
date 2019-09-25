const Promise = require('bluebird')
const fastify = require('fastify')
const { MongoClient } = require('mongodb')

const { CloudConnector } = require('./cloud-connector')
const { EventManager } = require('./event-manager')
const routes = require('./routes')

const options = {}

const mongoUri = process.env.MONGO_URI
const mongoPromise = MongoClient.connect(mongoUri, {
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

options.db = mongoPromise.then(client => client.db())
options.cloudConnector = new CloudConnector(options)
options.eventManager = new EventManager(options)

const app = options.app = fastify()

routes.configure(options)

app.listen(process.env.PORT, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
