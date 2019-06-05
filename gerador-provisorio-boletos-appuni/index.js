const axios = require('axios')
const qs = require('querystring')
const fs = require('fs')
const path = require('path')
const jwt = require('jwt-simple')
const { authSecret } = require('../.env')
const globalConfigContentPath = path.resolve(__dirname, 'globalConf.json')
const config = require('../knexfile.js')
const knex = require('knex')(config)
const moment = require('moment')

const sendTicketToMail = require('./email')

// knex.migrate.latest([config])
// knex.seed.run([config])

sendTicketToMail(
  {
    mail: 'g@g.com',
    cnpjcpf: '101010',
    ticketUrl: 'i.com/cisdfjs'
  },
  knex
)

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

async function getCostumers () {
  const customers = await knex('tabela com dados dos boletos')

  return customers
}

async function generateTicketsForCustomers (customers) {
  const conf = ggc()
  const token = await getToken()
  customers.forEach(async dataCustomer => {
    const pd = moment(dataCustomer.paydate).format('DD/MM/YYYY')
    const SAC_DATA = {
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      RSPTAR: '1', // RESPONSÁVEL PELA FATURA / 1 – Cedente ||  2 – Sacado
      ACPMAL: '0', // ENVIAR FATURA POR E-MAIL / 0 - NÃO || 1 -SIM /
      ACPSMS: '0', // ENVIAR FATURA POR SMS / 0 - NÃO || 1 - SIM /
      ALTCPG: '0', // AVISAR QUANDO PAGA
      ALTNPG: '0', // AVISAR QUANDO NÃO PAGA
      NOMSAC: dataCustomer.nameaccount,
      SACMAL: dataCustomer.email,
      CODCEP: dataCustomer.cep,
      CODUFE: dataCustomer.state,
      DSCEND: `${dataCustomer.type}. ${dataCustomer.logradouro}`,
      NUMEND: dataCustomer.number,
      DSCCPL: dataCustomer.complement,
      DSCBAI: '',
      DSCCID: dataCustomer.city,
      NUMPAI: '',
      CODOPR: '',
      NUMDDD: '',
      NUMTEL: '',
      CODCMF: dataCustomer.cnpjcpf,
      CALMOD: '1',
      DATVCT: pd,
      VLRBOL: dataCustomer.baseval,
      PCTJUR: conf.api.PCTJUR,
      DATVAL: pd
    }
    // Request to api-livre
    const ticketData = await generateTicket(token, SAC_DATA)
    console.log(ticketData)
    // const ticket_param = '?vl=f703655c-5f66-40ff-8f4e-0b4dfbe63a60'
    await knex
      .db('manuallyGeneratedTickets')
      .insert({
        cnpjcpf: dataCustomer.cnpjcpf,
        product: dataCustomer.product,
        valTicket: dataCustomer.valTicket,
        ticketUrl: `${conf.api.URLCONFAT}${ticketData.urlpst}`
      })
      .then(_ => {
        sendTicketToMail(
          {
            mail: dataCustomer.email,
            cnpjcpf: dataCustomer.cnpjcpf,
            ticketUrl: `${conf.api.URLCONFAT}${ticketData.urlpst}`
          },
          knex
        )
      })
      .catch(error => {
        console.log(error)
      })
  })
}
