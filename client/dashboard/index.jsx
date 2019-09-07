import React from 'react'

import EventDetails from './event-details.jsx'
import Status from './status.jsx'
import Operations from './operations.jsx'

export default function Dashboard (props) {
  return <div className='ui cards'>
    <EventDetails />
    <Status />
    <Operations onClose={props.onEventClosing} />
  </div>
}
