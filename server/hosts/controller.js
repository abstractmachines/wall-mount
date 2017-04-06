const fs = require('fs')
const path = require('path')

module.exports.query = (req, res) => {
  res.send(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../hosts.json'))))
}
