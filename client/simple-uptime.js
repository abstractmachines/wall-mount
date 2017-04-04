/**
 * Ping the listed hosts and display if they are online or not, plus a graph of
 * uptime updated every second.
 */

import * as d3 from 'd3'
import axios from 'axios'

const hosts = [
  'nitrogen.local',
  'foo',
  'bar',
  'bazz',
]

// const fakeData = {
//   'foo': {
//     currentStatus: 'online',
//     statusHistory: [
//       { status: 'online', time: new Date(), },
//     ],
//   },
//   'bar': {
//     currentStatus: 'offline',
//     statusHistory: [
//       { status: 'offline', time: new Date(), },
//     ],
//   },
//   'bazz': {
//     currentStatus: 'unknown',
//     statusHistory: [
//       { status: 'unknown', time: new Date(), },
//     ],
//   },
// }

const statusToColor = (s) => {
  switch(s) {
    case 'online':
    return 'green'
  case 'offline':
    return 'red'
  case 'unknown':
    return 'yellow'
  }
}

const body = d3.select('body')
const divs = body
  // .selectAll('div')
  .data(hosts)

setInterval(() => {
  axios.get('/api/uptime').then((res) => {
    const uptimeData = res.data
    // TODO: use an actual html template to bootstrap this

    const divs = body
      .selectAll('div')
      .data(hosts)

    // exit cleans stuff up using magic granted by Faustian bargains.
    divs.exit().remove()

    // enter - handles the creation and any fixed elements
    divs
      .enter()
      .append('div')
      .text(d => d)

    // update (implicit - no update() specified)
    divs
      .style('background-color', d => statusToColor(uptimeData[d].currentStatus))

  })
}, 1000)
