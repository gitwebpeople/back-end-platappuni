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


//console.log(globalConfigContentPath)
start()

async function start() {
  const c = await getCostumers()
  
  //generateTicketsForCustomers(c)
  const cu =  
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
      customer: 'SUBARU' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 43,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'YAMAHA' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 44,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'HONDA' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 45,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'TAURUS' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 46,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'S&W' },
    { id: 248,
      cnpjcpf: "05.875.029/0001-30",
      val_ticket: 47,
      contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
      type: 'PJ',
      customer: 'DAFRA' },
    // { id: 248,
    //   cnpjcpf: "05.875.029/0001-30",
    //   val_ticket: 43,
    //   contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
    //   type: 'PJ',
    //   customer: 'SUSUKI' },
    // { id: 248,
    //   cnpjcpf: "05.875.029/0001-30",
    //   val_ticket: 44,
    //   contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
    //   type: 'PJ',
    //   customer: 'SUSUKI' },
    // { id: 248,
    //   cnpjcpf: "05.875.029/0001-30",
    //   val_ticket: 45,
    //   contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
    //   type: 'PJ',
    //   customer: 'SUSUKI' },
    // { id: 248,
    //   cnpjcpf: "05.875.029/0001-30",
    //   val_ticket: 46,
    //   contacts: 'biellcrazy@gmail.com;gabriel.n64@hotmail.com',
    //   type: 'PJ',
    //   customer: 'SUSUKI' }
    ]

    cu.forEach(r => {
      getToken(r)
    })

}

/* PEGA DADOS DOS USUÁRIOS */
async function getCostumers() {
  const customers = await knex('customer_manually').where({ type: "PJ"})

  return customers
}

/* PREPARA DADOS PARA GERAÇÃO DO BOLETO E ENVIA PARA FUNÇÃO DO E-MAIL */
async function generateTicketsForCustomers(customers) {
  const conf = ggc()
  const token = '73ea2876-d036-4076-b5b3-a1f4877da73d' // 6/13/2019 7:07:23 PM
 
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
    await generateTicket(token, SAC_DATA, dataCustomer, valbol)
   
    //const ticketData = '?vl=f703655c-5f66-40ff-8f4e-0b4dfbe63a60'
  })
}

/* CARREGA CONFIGURAÇÕES GLOBAIS */
function ggc() {
  const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
  const confJson = JSON.parse(fileBuffer)
  return confJson
}
/* GERA TOKEN PARA GERAÇÃO DOS BOLETOS */
async function getToken(dataCustomer) {
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

  instance.post(conf.api.URL, data)
  .then(response => {

    const valbol = parseFloat(dataCustomer.val_ticket)
    const pd = "15/06/2019"//PAYDATE
    const email = dataCustomer.contacts.split(';')[0]
    console.log("token", response.data.usrtok)
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

    const data = qs.stringify({
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      USRTOK: response.data.usrtok,
      URLRET: '',
      TIPBOL: conf.api.TIPBOL,
      ...SAC_DATA
    })

    instance.post(conf.api.URL, data)
      .then(async r => {
        console.log("gerar boleto",r.data)
          knex('manually_generated_tickets')
          .insert({
            cnpjcpf: dataCustomer.cnpjcpf,
            customer: dataCustomer.customer,
            teste: true,
            email: dataCustomer.contacts,
            val_ticket: valbol,
            ticket_url: r.data.urlpst
          })
          .then(_ => {      
           
            console.log(dataCustomer.cnpjcpf, r.data.urlpst)
          })
          .catch(error => {
            console.log(error)
          })
      })
      .catch(err => {
        console.log(err)
      })


  })

}

/* GERA O BOLETO */
async function generateTicket(token, SAC_DATA,dataCustomer, valbol) {
  console.log(token)
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

    
    // .then(response => {
    //   console.log("ticket_livre", response.data.usrtok)
    //   return response.data
    // })
    // .catch(err => {
    //   return err
    // })
}
