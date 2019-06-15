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
const getToken = require("./getToken")
prepareData()

async function prepareData() {
  const customers = await knex("customer_manually").where({ type: "PJ" });

  getToken([{
    id: 248,
    cnpjcpf: "05.875.029/0001-30",
    val_ticket: 41,
    contacts: "biellcrazy@gmail.com;gabriel.n64@hotmail.com",
    type: "PJ",
    customer: "SUSUKI"
  }, {
    id: 248,
    cnpjcpf: "05.875.029/0001-30",
    val_ticket: 44,
    contacts: "biellcrazy@gmail.com;gabriel.n64@hotmail.com",
    type: "PJ",
    customer: "RENAN"
  }, 
  {
    id: 248,
    cnpjcpf: "05.875.029/0001-30",
    val_ticket: 43,
    contacts: "biellcrazy@gmail.com;gabriel.n64@hotmail.com",
    type: "PJ",
    customer: "SUSaPPUNIUKI"
  }]);
};
