const axios = require("axios");
const qs = require("querystring");
const fs = require("fs");
const path = require("path");
const jwt = require("jwt-simple");
const { authSecret } = require("../../.env");
const globalConfigContentPath = path.resolve(
  __dirname,
  "../../cron/scan/globalConf.json"
);
const config = require("../../knexfile.js");
const knex = require("knex")(config);
const moment = require("moment");

generateTicket({
    id: 248,
    cnpjcpf: "05.875.029/0001-30",
    val_ticket: 41,
    contacts: "biellcrazy@gmail.com;gabriel.n64@hotmail.com",
    type: "PJ",
    customer: "SUSUKI"
  }, '')

async function generateTicket(dataCustomer, token) {
  const conf = ggc();
  const valbol = parseFloat(dataCustomer.val_ticket);
  const pd = "15/06/2019"; //PAYDATE
  const email = dataCustomer.contacts.split(";")[0];
  const SAC_DATA = {
    FMTOUT: "JSON",
    USRKEY: conf.api.USER_KEY,
    RSPTAR: "1", // RESPONSÁVEL PELA FATURA / 1 – Cedente ||  2 – Sacado
    ACPMAL: "0", // ENVIAR FATURA POR E-MAIL / 0 - NÃO || 1 -SIM /
    ACPSMS: "0", // ENVIAR FATURA POR SMS / 0 - NÃO || 1 - SIM /
    ALTCPG: "0", // AVISAR QUANDO PAGA
    ALTNPG: "0", // AVISAR QUANDO NÃO PAGA
    NOMCED: "APPUNI SOLUÇÕES WEB EIRELI",
    NOMSAC: dataCustomer.customer,
    SACMAL: email,
    CODCEP: "",
    CODUFE: "",
    DSCEND: ``,
    NUMEND: "",
    DSCCPL: "",
    DSCBAI: "",
    DSCCID: "",
    NUMPAI: "",
    CODOPR: "",
    NUMDDD: "",
    NUMTEL: "",
    //CODCMF: dataCustomer.cnpjcpf.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""),
    CODCMF: dataCustomer.cnpjcpf,
    CALMOD: "1",
    DATVCT: pd,
    VLRBOL: valbol,
    PCTJUR: conf.api.PCTJUR,
    DATVAL: pd
  };

  const data = qs.stringify({
    FMTOUT: "JSON",
    USRKEY: conf.api.USER_KEY,
    USRTOK: '940bd4cb-c4d4-4ffd-9bee-2485fdd55291',
    URLRET: "",
    TIPBOL: conf.api.TIPBOL,
    ...SAC_DATA
  });

  const instance = axios.create({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept-charset": "UTF-8"
    }
  });

  instance
    .post(conf.api.URL, data)
    .then(async r => {
      console.log("Resposta para geração de boleto => ", r.data);
      knex("manually_generated_tickets")
        .insert({
          cnpjcpf: dataCustomer.cnpjcpf,
          customer: dataCustomer.customer,
          teste: true,
          email: dataCustomer.contacts,
          val_ticket: valbol,
          ticket_url: r.data.urlpst
        })
        .then(_ => {
          console.log(dataCustomer.cnpjcpf, r.data.urlpst);
          
        })
        .catch(error => {
          console.log(error);
          return;
        });
    })
    .catch(err => {
      console.log(err);
      return;
    });
};

function ggc() {
  const fileBuffer = fs.readFileSync(globalConfigContentPath, "utf-8");
  const confJson = JSON.parse(fileBuffer);
  return confJson;
}
