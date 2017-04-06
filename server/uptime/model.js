const R = require('ramda')
const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')

const hostsPath = path.resolve(__dirname, '../../hosts.json')
const hosts = JSON.parse(fs.readFileSync(hostsPath, 'utf8'))

const hostData = R.reduce((obj, h) => {
  return R.merge(obj, { [h]: { currentStatus: 'unknown', statusHistory:[] }})
}, {}, hosts)

module.exports.loadAndPollHosts = () => module.exports.pollHosts(hosts)

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
  return new Promise((resolve, reject) => {
    const ping = spawn('ping', [ '-c', '1', host ])
    ping.stdout.on('data', (data) => {
      const stringData = data.toString()
      // ping result:
      // 64 bytes from 10.0.1.2: icmp_seq=0 ttl=64 time=161.777 ms
      if(stringData.match(/(1 packets received)|(bytes from)/)) {
        resolve('online')
        // resolve('offline')
      }
      else {
        resolve('offline')
      }
    })

    ping.stderr.on('data', (data) => {
      console.error('error with ping', data.toString())
    })

    ping.on('close', (code) => console.log('ping ' + host + ' done with code', code))
  })
}

module.exports.getUptime = () => hostData
