import React, { Component } from 'react'

import axios from 'axios'
import moment from 'moment'

export default class EventDetails extends Component {
  constructor (props) {
    super(props)

    axios.get('/api/event/current')
      .then(response => {
        this.setState({
          eventData: response.data
        })
      })
      .catch(() => {
        this.setState({
          error: 'Error retrieving event data'
        })
      })

    this.state = {}
  }

  render () {
    let cardContent

    if (this.state.eventData) {
      const { name, startTime, endTime, city, region, country } = this.state.eventData

      cardContent = <div className='content'>
        <div className='header'>
            Event: {name}
        </div>
        <div className='meta'>
          {moment(startTime).format('Do MMMM')}
          {moment(endTime).isSame(startTime, 'day') ? null : `-${moment(endTime).format('Do MMMM')}`}
        </div>
        <div className='description'>
            City: {city} <br />
            Region: {region} <br />
            Country: {country} <br />
        </div>
      </div>
    } else if (this.state.error) {
      cardContent = <div className='content'>
        <div className='description'>
          {this.state.error}
        </div>
      </div>
    } else {
      cardContent = <div className='content'>
        <div className='ui active inline text loader'>Loading...</div>
      </div>
    }

    return <div className='ui card'>{cardContent}</div>
  }
}
