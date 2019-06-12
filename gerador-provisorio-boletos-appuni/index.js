const axios = require('axios')
const qs = require('querystring')
const fs = require('fs')
const path = require('path')
const jwt = require('jwt-simple')
const { authSecret } = require('../.env')
const globalConfigContentPath = path.resolve(__dirname, '../cron/scan/globalConf.json')
const config = require('../knexfile.js')
const knex = require('knex')(config)
const moment = require('moment')

const sendTicketToMail = require('./email')
//console.log(globalConfigContentPath)
start()

async function start() {
  const c = await getCostumers()
  
  //generateTicketsForCustomers(c)
  generateTicketsForCustomers( 
    [{ id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 41,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 42,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 43,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 44,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 45,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 46,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'SUSUKI' }
    ]
  )

}

/* PEGA DADOS DOS USUÁRIOS */
async function getCostumers() {
  const customers = await knex('customer_manually').where({ type: "PJ"})

  return customers
}

/* PREPARA DADOS PARA GERAÇÃO DO BOLETO E ENVIA PARA FUNÇÃO DO E-MAIL */
async function generateTicketsForCustomers(customers) {
  const conf = ggc()
  const token = await getToken()

  customers.forEach(async dataCustomer => {
    const valbol = parseFloat(dataCustomer.val_ticket)
    const pd = "15/06/2019"//PAYDATE
    const email = dataCustomer.contacts.split(';')[0]
 
    const SAC_DATA = {
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      RSPTAR: '1', // RESPONSÁVEL PELA FATURA / 1 – Cedente ||  2 – Sacado
      ACPMAL: '0', // ENVIAR FATURA POR E-MAIL / 0 - NÃO || 1 -SIM /
      ACPSMS: '0', // ENVIAR FATURA POR SMS / 0 - NÃO || 1 - SIM /
      ALTCPG: '0', // AVISAR QUANDO PAGA
      ALTNPG: '0', // AVISAR QUANDO NÃO PAGA
      NOMCED: 'APPUNI SOLUÇÕES WEB EIRELI',
      NOMSAC: dataCustomer.customer,
      SACMAL: email,
      CODCEP: "",
      CODUFE: "",
      DSCEND: ``,
      NUMEND: "",
      DSCCPL: "",
      DSCBAI: '',
      DSCCID: "",
      NUMPAI: '',
      CODOPR: '',
      NUMDDD: '',
      NUMTEL: '',
      //CODCMF: dataCustomer.cnpjcpf.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""),
      CODCMF: dataCustomer.cnpjcpf,
      CALMOD: '1',
      DATVCT: pd,
      VLRBOL: valbol,
      PCTJUR: conf.api.PCTJUR,
      DATVAL: pd
    }

    // Request to api-livre
    const ticketData = await generateTicket(token, SAC_DATA)
   
    //const ticketData = '?vl=f703655c-5f66-40ff-8f4e-0b4dfbe63a60'
    console.log('ticketGenerated', ticketData)

    await knex('manually_generated_tickets')
      .insert({
        cnpjcpf: dataCustomer.cnpjcpf,
        customer: dataCustomer.customer,
        val_ticket: valbol,
        ticket_url: `${conf.api.URLCONFAT}${ticketData.urlpst}`
      })
      .then(_ => {
        const emails = dataCustomer.contacts.split(';')
      
        emails.forEach(e => {
          sendTicketToMail(
            {
              email: e,
              cnpjcpf: dataCustomer.cnpjcpf,
              ticketUrl: `${ticketData.urlpst}`
            },
            knex,
            dataCustomer.type
          )
        })
        
      })
      .catch(error => {
        console.log(error)
      })
  })
}

/* CARREGA CONFIGURAÇÕES GLOBAIS */
function ggc() {
  const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
  const confJson = JSON.parse(fileBuffer)
  return confJson
}
/* GERA TOKEN PARA GERAÇÃO DOS BOLETOS */
async function getToken() {
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

/* GERA O BOLETO */
async function generateTicket(token, SAC_DATA) {
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
    // .then(response => {
    //   console.log("ticket_livre", response.data.usrtok)
    //   return response.data
    // })
    // .catch(err => {
    //   return err
    // })
}
