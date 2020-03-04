const Promise = require('bluebird')
const faker = require('faker')
const fastify = require('fastify')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const { MClient } = require('mhub')

const MHUB_CLIENT_ID = 'cloud-dummy'

const mhub = new MClient(process.env.MHUB_URI || 'ws://localhost:13900')
const mhubLogin = () => {
  return Promise.resolve(mhub.connect())
    .then(() => mhub.login('protected-client', process.env.PROTECTED_MHUB_PASSWORD || 'protected'))
    .catch(err => {
      if (err !== '') {
        return
      }
      throw err
    })
}

function fakeMongoId () {
  return new Array(6).fill().map(() => faker.random.number(65536).toString(16)).join('')
}

function generateTeams () {
  const teamsNumber = faker.random.number({ min: 20, max: 50 })
  return new Array(teamsNumber).fill().map(() => {
    return {
      _id: fakeMongoId(),
      number: faker.random.number(5000),
      name: faker.commerce.productName(),
      affiliation: faker.random.boolean() ? faker.company.companyName() : undefined,
      cityState: faker.random.boolean() ? faker.address.state() : faker.address.city(),
      country: faker.address.country(),
      coach1: faker.name.findName(),
      coach2: faker.random.boolean() ? faker.name.findName() : undefined,
      judgingGroup: faker.random.number(5),
      pitNumer: faker.random.number(teamsNumber),
      pitLocation: faker.random.boolean(),
      translationNeeded: faker.random.boolean()
    }
  })
}

function generateScores () {
  return teams.map(team => [
    {
      _id: fakeMongoId(),
      teamNumber: team.number,
      stage: 'Practice',
      round: 1,
      score: faker.random.number(500),
      published: true
    },
    {
      _id: fakeMongoId(),
      teamNumber: team.number,
      stage: 'Qualifications',
      round: 1,
      score: faker.random.number(500),
      published: true
    },
    {
      _id: fakeMongoId(),
      teamNumber: team.number,
      stage: 'Qualifications',
      round: 2,
      score: faker.random.number(500),
      published: true
    },
    {
      _id: fakeMongoId(),
      teamNumber: team.number,
      stage: 'Qualifications',
      round: 3,
      score: faker.random.number(500),
      published: true
    }
  ])
    .reduce((arr, addition) => arr.concat(addition), [])
}

function generateEvent () {
  return {
    _id: fakeMongoId(),
    name: faker.commerce.productName(),
    startTime: faker.date.future().toString(),
    endTime: faker.date.future().toString(),
    city: faker.address.city(),
    region: faker.address.state(),
    country: faker.address.country(),
    key: faker.random.alphaNumeric(32)
  }
}

const readFile = Promise.promisify(fs.readFile)
const writeFile = Promise.promisify(fs.writeFile)
const mkdirpAsync = Promise.promisify(mkdirp)

const TEAMS_FILE = path.resolve('./data/dummy/teams.json')
const SCORES_FILE = path.resolve('./data/dummy/scores.json')
const EVENT_FILE = path.resolve('./data/dummy/event.json')
const EVENT_KEY_FILE = path.resolve('./data/dummy/event-key.json')

let teams = []
let scores = []
let event = null

readFile(TEAMS_FILE)
  .then(JSON.parse)
  .then(teamsFromFile => { teams = teamsFromFile })
  .catch(err => {
    if (err.code === 'ENOENT') {
      teams = generateTeams()
      return mkdirpAsync(path.dirname(TEAMS_FILE))
        .then(() => writeFile(TEAMS_FILE, JSON.stringify(teams)))
        .throw(err)
    } else {
      throw err
    }
  })
  .then(() => readFile(SCORES_FILE))
  .then(JSON.parse)
  .then(scoresFromFile => { scores = scoresFromFile })
  .catch(err => {
    if (err.code !== 'ENOENT') {
      throw err
    }
    scores = generateScores()
    return mkdirpAsync(path.dirname(SCORES_FILE))
      .then(() => writeFile(SCORES_FILE, JSON.stringify(scores)))
  })

readFile(EVENT_FILE)
  .then(JSON.parse)
  .then(eventFromFile => { event = eventFromFile })
  .catch(err => {
    if (err.code === 'ENOENT') {
      event = generateEvent()
      return mkdirpAsync(path.dirname(EVENT_FILE))
        .then(() => writeFile(EVENT_FILE, JSON.stringify(event)))
    } else {
      throw err
    }
  })
  .then(() => writeFile(EVENT_KEY_FILE, JSON.stringify({ event: event._id, jwt: event.key })))
  .catch(err => { throw err })

const app = fastify()

app.get('/team/all', (request, reply) => {
  reply.send(teams)
})

app.get('/team/:id', (request, reply) => {
  const team = teams.find(s => s._id === request.params.id)
  if (team) {
    reply.send(team)
  } else {
    reply.status(404).send()
  }
})

app.get('/scores/public', (request, reply) => {
  reply.send(scores)
})

app.get('/scores/:id', (request, reply) => {
  const score = scores.find(s => s._id === request.params.id)
  if (score) {
    reply.send(score)
  } else {
    reply.status(404).send()
  }
})

app.post('/fake/team', (request, reply) => {
  mhubLogin()
    .then(() => mhub.publish('protected', 'teams:reload', {
      action: faker.random.arrayElement(['add', 'update']),
      id: faker.random.arrayElement(teams)._id
    }, {
      'client-id': MHUB_CLIENT_ID
    }))
    .then(() => reply.send())
    .catch(err => reply.status(500).send(err))
})

app.post('/fake/score', (request, reply) => {
  mhubLogin()
    .then(() => mhub.publish('protected', 'scores:reload', {
      action: faker.random.arrayElement(['add', 'update']),
      id: faker.random.arrayElement(scores)._id
    }, {
      'client-id': MHUB_CLIENT_ID
    }))
    .then(() => reply.send())
    .catch(err => reply.status(500).send(err))
})

app.get('/api/agent/event/:id', (request, reply) => {
  if (event.key !== request.headers['x-auth-token']) {
    reply.status(401).send()
  } else if (event._id === request.params.id) {
    reply.send(event)
  } else {
    reply.status(404).send()
  }
})

app.post('/api/agent/event/:id/message', (request, reply) => {
  if (event.key !== request.headers['x-auth-token']) {
    reply.status(401).send()
  } else if (event._id !== request.params.id) {
    reply.status(404).send()
  } else {
    console.log('cloud message: ', request.body)
    reply.send()
  }
})

app.listen(process.env.PORT, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
