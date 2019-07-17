const axios = require('axios')
const qs = require('querystring')

const { baseConf } = require('./config')

module.exports = {
  getToken: () => {
    const conf = baseConf()

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
    return new Promise((resolve, reject) => {
      instance.post(conf.api.URL, data).then(response => {
        if (response.data.usrtok) {
          resolve(response.data.usrtok)
        } else {
          reject(response.data.dscerr)
        }
      })
    })
  },

  generateTicket: (token, ticketData) => {
    const conf = baseConf()
    const d = ticketData

    const instance = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept-charset': 'UTF-8'
      }
    })

    const SAC_DATA = {
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      RSPTAR: '1', // RESPONSÁVEL PELA FATURA / 1 – Cedente ||  2 – Sacado
      ACPMAL: '0', // ENVIAR FATURA POR E-MAIL / 0 - NÃO || 1 -SIM /
      ACPSMS: '0', // ENVIAR FATURA POR SMS / 0 - NÃO || 1 - SIM /
      ALTCPG: '0', // AVISAR QUANDO PAGA
      ALTNPG: '0', // AVISAR QUANDO NÃO PAGA
      NOMCED: 'APPUNI SOLUÇÕES WEB EIRELI',
      NOMSAC: d.customer,
      SACMAL: d.email,
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
      CODCMF: d.cnpjcpf == 18 ? d.cnpjcpf : d.cnpjcpf.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
        ''
      ),
      CALMOD: '1',
      DATVCT: d.pd,
      VLRBOL: d.val_ticket,
      PCTJUR: conf.api.PCTJUR,
      DATVAL: d.pd
    }

    const data = qs.stringify({
      FMTOUT: 'JSON',
      USRKEY: conf.api.USER_KEY,
      USRTOK: token,
      URLRET: '',
      TIPBOL: conf.api.TIPBOL,
      ...SAC_DATA
    })
    return new Promise((resolve, reject) => {
      instance
        .post(conf.api.URL, data)
        .then(response => {
          if (response.data.urlpst) {
            resolve(response.data.urlpst)
          } else {
            reject(response.data.dscerr)
          }
        })
    })
  }

}
