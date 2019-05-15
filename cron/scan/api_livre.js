const axios = require('axios');
const qs = require('querystring')

module.exports = () => {
  const _URL = "http://ws1.api.livre.com.br/slip/slip";
  const USER_KEY = "eaa675a4-d3dd-4b2c-ae40-40d312ceb9f5";

  async function getToken() {
    const instance = axios.create({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-charset": "UTF-8"
      }
    });

    const data = qs.stringify({
      FMTOUT: "JSON",
      USRKEY: USER_KEY
    });

    const response = await instance.post(_URL, data);

    return response.data.usrtok;
  }

  async function generateTicket(token, SAC_DATA) {
    const data = qs.stringify({
      FMTOUT: "JSON",
      USRKEY: USER_KEY,
      USRTOK: token,
      URLRET: "",
      TIPBOL: "5",
      ...SAC_DATA
    });

    const instance = axios.create({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-charset": "UTF-8"
      }
    });

    const response = await instance.post(_URL, data);

    return response.data
  }

  return {
      getToken,
      generateTicket,
      _URL,
      USER_KEY
  };
};
