
const fastify = require('fastify')

const app = fastify()

app.get('/api/event/5d3c54f650237573a7b2a4b3', (request, response) => {
  response.send({
    name: 'Event 1',
    startTime: new Date().toString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toString(),
    city: 'Tel-Aviv',
    region: 'Israel',
    country: 'Israel'
  })
})

app.listen(process.env.PORT, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
