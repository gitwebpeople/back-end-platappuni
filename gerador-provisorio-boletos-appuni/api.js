const path = require('path')
const async = require('async')
const qs = require('querystring')
const axios = require('axios')
const globalConfigContentPath = path.resolve(__dirname, '../cron/scan/globalConf.json')
const fs = require('fs')
const config = require('../knexfile.js')
const knex = require('knex')(config)
geraBoletos()

/* CARREGA CONFIGURAÇÕES GLOBAIS */
function ggc() {
    const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
    const confJson = JSON.parse(fileBuffer)
    return confJson
  }

function geraBoletos() {
    async.waterfall(
        [
          function (done) {
            //const token = '73ea2876-d036-4076-b5b3-a1f4877da73d' // 6/13/2019 7:07:23 PM
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
                    console.log(response.data)
                    done(null, response.data.usrtok)
                })
                .catch(err => {
                    done(err)
                })
          },
          function(token, done) {
            //const customers = await knex('customer_manually').where({ type: "PJ"})
            return done(null, token, [{ id: 248,
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
                customer: 'TAURUS' }])
          },
          function (token, customers, done) {

            const conf = ggc()

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
                
                 await instance.post(conf.api.URL, data)
                    .then(async response => {
                    console.log('ticketGenerated', response.data)
                        await knex('manually_generated_tickets')
                        .insert({
                        cnpjcpf: dataCustomer.cnpjcpf,
                        customer: dataCustomer.customer,
                        teste: true,
                        email: dataCustomer.contacts,
                        val_ticket: valbol,
                        ticket_url: response.data.urlpst
                        })
                        .then(_ => {
                            if(response.data.urlpst == '')
                               return  done(response.data.srcerr)
                            else       
                            console.log(dataCustomer.cnpjcpf, response.data.urlpst)
                        })
                        .catch(error => {
                            return done(error)
                        })
                    })
                    .catch(err => {
                        return done(err)
                    })
              })
          },
          function(final, done){
            console.log(final)
            done()
          }
        ],
        function (err) {
            console.log('ERRO', err)
            return;
        }
      )
}