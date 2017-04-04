const model = require('./model.js')

module.exports.query = (req, res) => {
  res.send(model.getUptime())
}

