const { getCorrelationId } = require('@first-lego-league/ms-correlation')
const Promise = require('bluebird')
const { MClient } = require('mhub')

const MHUB_CLIENT_ID = 'cloud-agent'
const RETRY_TIMEOUT = 10 * 1000 // 10 seconds
const NODE = 'protected'

exports.MhubConnector = class {
  constructor ({ logger, config }) {
    this._logger = logger
    this._mhubUri = config.mhubUri
    this._mhubPassword = config.mhubPassword
    this._topics = []

    this._client = new MClient(config.mhubUri)

    this._client.on('error', error => {
      logger.error(`Unable to connect to mhub, other modules won't be notified changes: ${error.toString()}`)
    })

    this._client.on('close', () => {
      this._retryConnection()
    })
  }

  _retryConnection () {
    this._connectionPromise = null
    this._logger.warn('Disconnected from mhub')
    setTimeout(() => {
      this._logger.info('Retrying mhub connection')
      this._connect()
        .then(() => Promise.all(this._client.topics.map(topic => this._client.subscribe(NODE, topic))))
        .catch(() => this._retryConnection())
    }, RETRY_TIMEOUT)
  }

  _connect () {
    if (!this._connectionPromise) {
      this._connectionPromise = this._client.connect()
        .then(() => this._client.login('protected-client', this._mhubPassword))
        .then(() => this._logger.info('Connected to mhub'))
        .catch(() => this._retryConnection())
    }
    return this._connectionPromise
  }

  listen (topic, listener) {
    this._client.on('message', message => {
      if (message.topic === topic) {
        listener(message.data, message)
      }
    })

    this._topics.push(topic)

    return this._connect()
      .then(() => this._client.subscribe(NODE, topic))
  }

  send (topic, data = {}) {
    return this._connect()
      .then(() => this._client.publish('protected', topic, data, {
        'client-id': MHUB_CLIENT_ID,
        'correlation-id': getCorrelationId()
      }))
  }
}
