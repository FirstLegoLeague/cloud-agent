
import axios from 'axios'
import moment from 'moment'
import DropZone from 'react-drop-zone'
import React, { Component } from 'react'

export default class EventPicker extends Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null,
      event: null,
      eventKey: null
    }
  }

  readFile (rawKey) {
    try {
      const eventKey = JSON.parse(rawKey)
      this.setState({
        eventKey,
        error: null
      })

      setImmediate(() => {
        axios.get(`/api/event/${eventKey.event}`, {
          headers: {
            'X-Auth-Token': eventKey.jwt
          }
        })
          .then(response => {
            this.setState({
              eventKey: eventKey,
              eventData: response.data,
              error: null
            })
          })
          .catch(() => {
            this.setState({
              eventKey: null,
              eventData: null,
              error: 'Error retrieving event data!'
            })
          })
      })
    } catch (e) {
      this.setState({
        eventKey: null,
        eventData: null,
        error: 'Error reading the event key!'
      })
    }
  }

  declineEvent () {
    this.setState({
      eventKey: null,
      eventData: null,
      error: null
    })
  }

  render () {
    return <div className='ui segment'>
      {this.renderWorkspace()}
      {this.state.error && <div className='ui red message'>{this.state.error}</div>}
    </div>
  }

  renderWorkspace () {
    if (this.state.eventKey && this.state.eventData) {
      return this.renderEventDetails(this.state.eventKey, this.state.eventData)
    } else if (this.state.eventKey) {
      return this.renderLoader()
    } else {
      return this.renderDropZone()
    }
  }

  renderEventDetails (eventKey, eventData) {
    const { name, startTime, endTime, city, region, country } = eventData

    return <div className='ui placeholder segment'>
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {name}
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
        <div className='extra content'>
          <div className='ui two buttons'>
            <div className='ui basic green button'
              onClick={() => this.props.onApproval(eventKey)}>Approve</div>
            <div className='ui basic red button' onClick={() => this.declineEvent()}>Decline</div>
          </div>
        </div>
      </div>
    </div>
  }

  renderLoader () {
    return <div className='ui placeholder segment'>
      <div className='ui icon header'>
        <div className='ui active inline text loader'>Loading...</div>
      </div>
    </div>
  }

  renderDropZone () {
    return <DropZone onDrop={(file, text) => this.readFile(text)}>
      {
        ({ over, overDocument }) =>
          <div className='ui placeholder segment'>
            <div className='ui icon header'>
              <i className='code file outline icon' />
              Drag your event key
            </div>
          </div>
      }
    </DropZone>
  }
}
