const express = require('express')
const bodyParser = require('body-parser')
const uptimeController = require('./uptime/controller.js')
const uptimeModel = require('./uptime/model.js')

const app = express()

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/'))

app.get('/api/uptime', uptimeController.query)

const port = 3101
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

setInterval(() => uptimeModel.pollHosts([ 'nitrogen.local' ]), 5000)
