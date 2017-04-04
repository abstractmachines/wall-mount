const R = require('ramda')
const spawn = require('child_process').spawn

const hostData = {
  'nitrogen.local': {
    currentStatus: 'unknown',
    statusHistory: [],
  },
  'foo': {
    currentStatus: 'unknown',
    statusHistory: [
      { status: 'online', time: new Date(), },
    ],
  },
  'bar': {
    currentStatus: 'unknown',
    statusHistory: [
      { status: 'offline', time: new Date(), },
    ],
  },
  'bazz': {
    currentStatus: 'unknown',
    statusHistory: [
      { status: 'unknown', time: new Date(), },
    ],
  },
}

module.exports.pollHosts = (hosts) => {
  R.zip(hosts, R.map(pollUptime, hosts)).forEach(u => {
    const host = u[0]
    const promise = u[1]
    promise.then(R.partial(updateHost, [ host ]))
  })
}

function updateHost(host, status) {
  hostData[host].currentStatus = status
  return status // just chain the value back
}

function pollUptime(host) {
  const ping = spawn('ping', [ '-c', '1', host ])
  return new Promise((resolve, reject) => {
    ping.stdout.on('data', (data) => {
      const stringData = data.toString()
      // console.log('data', stringData)
      // ping start
      // PING nitrogen.local (10.0.1.2): 56 data bytes
      // if(stringData.match(/^PING/)) {
      //   console.log('using unknown')
      //   return 'unknown'
      // }
      // ping result:
      // 64 bytes from 10.0.1.2: icmp_seq=0 ttl=64 time=161.777 ms
      if(stringData.match(/(1 packets received)|(bytes from)/)) {
        resolve('online')
        // resolve('offline')
      }
      else {
        console.log('using offline', stringData)
        resolve('offline')
      }
    })

    ping.stderr.on('data', (data) => {
      console.error('error with ping', data.toString())
    })

    // ping.on('close', (code) => console.log('ping done with code', code))
  })
}

module.exports.getUptime = () => hostData
