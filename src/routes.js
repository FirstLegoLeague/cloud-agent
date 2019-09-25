
function transformEvent (event) {
  return {
    name: event.name,
    startTime: event.startTime,
    endTime: event.endTime,
    city: event.city,
    region: event.region,
    country: event.country
  }
}

exports.configure = ({ app, cloudConnector, eventManager }) => {
  app.get('/api/event/:eventId', (request, reply) => {
    cloudConnector.getEventInfo(request.params.eventId)
      .then(event => {
        reply.send(transformEvent(event))
      })
      .catch(err => {
        if (err.code === 'NOT_FOUND') {
          reply.status(404).send()
        } else {
          reply.status(500).send(err.toString())
        }
      })
  })

  app.get('/api/event/current', (request, reply) => {
    eventManager.getCurrentEvent()
      .then(event => reply.send(transformEvent(event)))
      .catch(err => {
        if (err.code === 'NOT_FOUND') {
          reply.status(404).send()
        } else {
          reply.status(500).send(err.toString())
        }
      })
  })

  app.head('/api/event/current', (request, reply) => {
    eventManager.getCurrentEvent()
      .then(() => reply.send())
      .catch(err => {
        if (err.code === 'NOT_FOUND') {
          reply.status(404).send()
        } else {
          reply.status(500).send()
        }
      })
  })

  app.post('/api/event/current', (request, reply) => {
    eventManager.setCurrentEvent(request.body.event, request.body.jwt)
      .then(() => reply.send())
      .catch(err => {
        if (err.code === 'NOT_FOUND') {
          reply.status(404).send()
        } else {
          reply.status(500).send(err.toString())
        }
      })
  })

  app.get('/api/status', (request, response) => {
    response.send({
      online: true,
      pending: 3
    })
  })

  app.post('/api/event/close', (request, reply) => {
    eventManager.closeCurrentEvent()
      .then(() => reply.send())
      .catch(err => {
        if (err.code === 'NOT_FOUND') {
          reply.status(404).send()
        } else {
          reply.status(500).send(err.toString())
        }
      })
  })
}
