const Promise = require('bluebird')

exports.CloudConnector = class {
  getEventInfo (eventId) {
    if (eventId === '5d8b0b4551a48b135ec4b4a5') {
      return Promise.resolve({
        _id: '5d8b0b4551a48b135ec4b4a5',
        name: 'Event 1',
        startTime: new Date().toString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toString(),
        city: 'Tel-Aviv',
        region: 'Israel',
        country: 'Israel'
      })
    } else {
      return Promise.reject(Object.assign(new Error(), { code: 'NOT_FOUND' }))
    }
  }
}
