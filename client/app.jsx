import React, { Component } from 'react'

import axios from 'axios'

import EventPicker from './event-picker.jsx'
import Dashboard from './dashboard/index.jsx'

export default class App extends Component {
  constructor (props) {
    super(props)

    axios.head('/api/event/current', {
      validateStatus: code => code < 500
    })
      .then(response => {
        if (response.status === 404) {
          this.setState({ status: 'event-picker' })
        } else {
          this.setState({ status: 'dashboard' })
        }
      })
      .catch(err => {
        console.error('Error closing event', err)
      })

    this.state = { status: 'loading' }
  }

  onApproval (eventKey) {
    this.setState({ status: 'loading' })
    axios.post('/api/event/current', eventKey)
      .then(() => {
        this.setState({ status: 'dashboard' })
      })
      .catch(err => {
        console.error('Error closing event', err)
      })
  }

  onEventClosing () {
    this.setState({ status: 'event-picker' })
  }

  render () {
    let mainComponent

    switch (this.state.status) {
      case 'loading':
        mainComponent = <div className='ui icon header'>
          <div className='ui active inline text loader'>Loading...</div>
        </div>
        break
      case 'dashboard':
        mainComponent = <Dashboard onEventClosing={() => this.onEventClosing()} />
        break
      case 'event-picker':
        mainComponent = <EventPicker onApproval={ek => this.onApproval(ek)} />
        break
    }

    return <div id='main-container'>
      <div className='ui center aligned segment'>
        <h1 className='ui header'>Cloud Agent</h1>
      </div>
      {mainComponent}
    </div>
  }
}
