const fastify = require('fastify')
const faker = require('faker')

const app = fastify()

const teamsNumber = faker.random.number({ min: 20, max: 50 })
const teams = new Array(teamsNumber).fill().map(() => {
  return {
    _id: new Array(6).fill().map(() => faker.random.number(65536).toString(16)).join(''),
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

const scores = teams.map(team => [
  { teamNumber: team.number, stage: 'Practice', round: 1, score: faker.random.number(500), published: true },
  { teamNumber: team.number, stage: 'Qualifications', round: 1, score: faker.random.number(500), published: true },
  { teamNumber: team.number, stage: 'Qualifications', round: 2, score: faker.random.number(500), published: true },
  { teamNumber: team.number, stage: 'Qualifications', round: 3, score: faker.random.number(500), published: true }
])
  .reduce((arr, addition) => arr.concat(addition), [])

app.get('/team/all', (request, reply) => {
  reply.send(teams)
})

app.get('/scores/public', (request, reply) => {
  reply.send(scores)
})

// app.get('/api/event/current', (request, response) => {
//   response.send({
//     name: 'Event 1',
//     startTime: new Date().toString(),
//     endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toString(),
//     city: 'Tel-Aviv',
//     region: 'Israel',
//     country: 'Israel'
//   })
// })
//
// app.head('/api/event/current', (request, response) => {
//   response.status(404).send()
// })
//
// app.post('/api/event/current', (request, response) => {
//   response.send({})
// })
//
// app.get('/api/status', (request, response) => {
//   response.send({
//     online: true,
//     pending: 3
//   })
// })
//
// app.post('/api/event/close', (request, response) => {
//   response.send({})
// })
//
app.listen(process.env.PORT, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
