import React, { Component } from 'react'

import axios from 'axios'

export default class Operations extends Component {
  closeEvent () {
    axios.post('/api/event/close')
      .then(() => {
        this.props.onClose()
      })
      .catch(err => {
        console.error('Error closing event', err)
      })
  }

  render () {
    return <div className='card'>
      <div className='content' >
        <div className='ui button' onClick={() => this.closeEvent()}>Close event</div>
      </div>
    </div>
  }
}
