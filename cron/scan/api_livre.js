const axios = require('axios')
const qs = require('querystring')
const fs = require('fs')
const path = require('path')
const jwt = require('jwt-simple')
const { authSecret } = require('../../.env')
const globalConfigContentPath = path.resolve(__dirname, 'globalConf.json')

module.exports = app => {
  const { registerUserLogActivity } = app.components.security

  async function setGlobalConf (req, res) {
    const conf = req.body || null
    const confJson = JSON.stringify(conf)
    delete confJson.ip
    delete confJson.logDate
    console.log(confJson)
    const ret = fs.writeFileSync(globalConfigContentPath, confJson)
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    try {
      await registerUserLogActivity({
        id: user.id,
        activity: 'Atualizando configurações globais',
        ip: req.body.ip,
        date: req.body.logDate
      })
      return res.status(200).send(ret)
    } catch (msg) {
      console.log(confJson)
      return res.status(200).send(msg)
    }
  }

  function getGlobalConf (req, res) {
    return res.json(ggc())
  }
  function ggc () {
    const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
    const confJson = JSON.parse(fileBuffer)
    return confJson
  }

  async function getToken () {
    const conf = ggc()
    const instance = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-charset': 'UTF-8'
      }
    })

    const data = qs.stringify({
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY
    })

    const response = await instance.post(conf.api.URL, data)
    return response.data.usrtok
  }

  async function generateTicket (token, SAC_DATA) {
    const conf = ggc()
    const data = qs.stringify({
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      USRTOK: token,
      URLRET: '',
      TIPBOL: conf.api.TIPBOL,
      ...SAC_DATA
    })

    const instance = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-charset': 'UTF-8'
      }
    })
    const response = await instance.post(conf.api.URL, data)
    return response.data
  }

  return {
    getToken,
    generateTicket,
    setGlobalConf,
    getGlobalConf,
    ggc
  }
}
