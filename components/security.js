const { authSecret } = require('../.env')
const jwt = require('jwt-simple')

module.exports = app => {
  async function getHistoryActivities (req, res) {
    const cd = jwt.decode(req.get('Authorization').replace('bearer ', ''), authSecret)
    const result = await app.db('user_logs').where({ userId: cd.id }).first()

    return res.json(result)
  }
  async function registerUserLogActivity (logData) {
    await app.db('user_logs').insert({ activity: logData.activity, ip: logData.ip, userId: logData.id, date: logData.date })
      .then(_ => {
        return true
      })
      .catch(error => {
        throw error.message
      })
  }
  function registerAdminLogActivity (res, logData) {
    app.db('admin_logs').insert({ activity: logData.activity, ip: logData, userId: logData, date: logData.date })
      .then(_ => {
        res.sendStatus(200)
      })
      .catch(error => {
        res.send(error).status(500)
      })
  }
  return {
    registerUserLogActivity,
    registerAdminLogActivity,
    getHistoryActivities
  }
}
