const axios = require('axios')
const qs = require('querystring')
const fs = require('fs')
const path = require('path')
const jwt = require('jwt-simple')
const { authSecret } = require('../../.env')
const globalConfigContentPath = path.resolve(
  __dirname,
  '../../cron/scan/globalConf.json'
)
const config = require('../../knexfile.js')
const knex = require('knex')(config)
const moment = require('moment')

const sendMail = require('../email')
// const generateTicket = require("./generateTicket");

getToken()

/* GERA TOKEN PARA GERAÇÃO DOS BOLETOS */
async function getToken () {
  const conf = ggc()
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept-charset': 'UTF-8'
    }
  })

  const clientes = await knex('customer_manually').where({ finished: false })

  let index = 0
  console.log(clientes.length)
  ;(function myLoop (i) {
    setTimeout(function () {
      // sendMail(c[a])

      const data = qs.stringify({
        FMTOUT: 'JSON',
        USRKEY: conf.api.USER_KEY
      })

      instance.post(conf.api.URL, data).then(response => {
        const dataCustomer = clientes[index]

        const token = response.data.usrtok

        const conf = ggc()
        const valbol = parseFloat(dataCustomer.val_ticket)
        const pd = '24/06/2019' // PAYDATE
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
          CODCEP: '',
          CODUFE: '',
          DSCEND: ``,
          NUMEND: '',
          DSCCPL: '',
          DSCBAI: '',
          DSCCID: '',
          NUMPAI: '',
          CODOPR: '',
          NUMDDD: '',
          NUMTEL: '',
          // CODCMF: dataCustomer.cnpjcpf.replace(
          //   /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
          //   ''
          // ),
          CODCMF: dataCustomer.cnpjcpf == 18 ? dataCustomer.cnpjcpf : dataCustomer.cnpjcpf.replace(
            /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
            ''
          ),
          CALMOD: '1',
          DATVCT: pd,
          VLRBOL: valbol,
          PCTJUR: conf.api.PCTJUR,
          DATVAL: pd
        }

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

        instance
          .post(conf.api.URL, data)
          .then(async r => {
            console.log('Resposta para geração de boleto => ', r.data.dscerr)
            console.log('Resposta para geração de boleto srcerr => ', r.data.srcerr)
            console.log(dataCustomer.customer + ' => ', r.data.urlpst)
            const generated = !!r.data.urlpst
            knex('manually_generated_tickets')
              .insert({
                cnpjcpf: dataCustomer.cnpjcpf,
                customer: dataCustomer.customer,
                teste: false,
                generated,
                type: dataCustomer.type,
                email: dataCustomer.contacts,
                val_ticket: valbol,
                ticket_url: r.data.urlpst
              })
              .then(async _ => {
                if (r.data.urlpst) {
                  console.log(index + 1)

                  console.log('Enviando email...')
                  dataCustomer.ticket_url = r.data.urlpst
                  await sendMail(dataCustomer, dataCustomer.type)
                  console.log('Email enviado')
                  index++
                } else {
                  process.exit(1)
                }
              })
              .catch(error => {
                console.log(error)
              })
          })
          .catch(err => {
            console.log(err)
          })
      })

      //  your code here

      if (--i) myLoop(i) //  decrement i and call myLoop again if i > 0
    }, 10000)
  })(clientes.length)

  /* clientes.forEach(cliente => {
    const data = qs.stringify({
        FMTOUT: "JSON",
        USRKEY: conf.api.USER_KEY
      });

       instance.post(conf.api.URL, data).then(response => {
        const token = response.data.usrtok;
        console.log("Token gerado => ", token);
        generateTicket(cliente, token);
      });
  }); */
}

function ggc () {
  const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
  const confJson = JSON.parse(fileBuffer)
  return confJson
}
