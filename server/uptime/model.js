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

/* TODO
The timestamp is a data storage thing.
I don't mind if we just wait until we're just about to talk to the db, or the
db itself adds the timestamp.

The thing about something like a regex like this is we can determine the
'online' portion at the *same time* we determine the latency.
So this is what I want to see with the regex.
So, latency is the time=

const matchData = stringData.match(
/bytes from (.*?): icmp_seq=(.*?) ttl=(.*?) time=([\d\.]+?) ms$/)
 bytes from [\d+\.]*: icmp_seq=\d* ttl=\d* time=\d*.\d ms
if(matchData) {
  const latency = matchData[4]
  resolve(...

  it returns the 4th match group.
  I should surround it with a parseFloat or whatever it is.
*/

// TODO latency 0 when offline
// TODO don't use timestamp, use latency (time= in ping data) to put into object

function pollUptime(host) {
  return new Promise((resolve, reject) => {
    const ping = spawn('ping', [ '-c', '1', host ])

    ping.stdout.on('data', (data) => {

      const stringData = data.toString()
      const pingStamp = Date.now()
      // ping result:
      // 64 bytes from 10.0.1.2: icmp_seq=0 ttl=64 time=161.777 ms

      const pingLine = stringData.match(
        /\d* bytes from (.*?): icmp_seq=(.*?) ttl=(.*?) time=([\d\.]+?) ms/g)

      console.log('pingLiiiiiine ', pingLine)

      // const matchyFoo = pingLine[1]
      //
      // console.log('pingLTIIIIIIIME ', matchyFoo)

      const pingBack = {
        status: '',
        info: '',
        timestamp: pingStamp
      }
      if(pingLine) {
        pingBack.status = 'online'
        pingBack.info = pingLine
        resolve(pingBack)
      }
      else {
        pingBack.status = 'offline'
        pingBack.info = ''
        resolve(pingBack)
      }
    })

    ping.stderr.on('data', (data) => {
      console.error('error with ping', data.toString())
    })

    ping.on('close', (code) => console.log('ping ' + host + ' done with code', code))

  })
}

module.exports.getUptime = () => hostData
