import React, { Component } from 'react'

import EventPicker from './event-picker.jsx'

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  onApproval (eventKey) {
    this.setState({ loading: true })
  }

  render () {
    return <div id='main-container'>
      <div className='ui center aligned segment'>
        <h1 className='ui header'>Cloud Agent</h1>
      </div>
      {!this.state.loading ? <EventPicker onApproval={ek => this.onApproval(ek)} /> : null}
    </div>
  }
}
