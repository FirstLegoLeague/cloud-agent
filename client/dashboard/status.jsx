import React, { Component } from 'react'

import axios from 'axios'

export default class Status extends Component {
  constructor (props) {
    super(props)

    axios.get('/api/status')
      .then(response => {
        this.setState({
          statusData: response.data,
          error: null
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

    if (this.state.statusData) {
      const { pending, online } = this.state.statusData

      cardContent = <div className='ui statistics'>
        <div className='statistic'>
          <div className='label'>
            Pending Messages
          </div>
          <div className='value'>
            {pending} <i className='paper plane outline icon' />
          </div>
        </div>
        <div className={(online ? 'green' : 'red') + ' statistic'}>
          <div className='label'>
            { online ? 'Online' : 'Offline'}
          </div>
          <div className='value'>
            <i className='circle icon' />
          </div>
        </div>
      </div>
    } else if (this.state.error) {
      cardContent = <div className='description'>
        {this.state.error}
      </div>
    } else {
      cardContent = <div className='ui active inline text loader'>Loading...</div>
    }

    return <div className='card'>
      <div className='content' >{cardContent}</div>
    </div>
  }
}
