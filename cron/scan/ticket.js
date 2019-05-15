/* eslint-disable no-console */
const moment = require("moment");
module.exports = app => {

  const { USER_KEY, generateTickets, ggc  } = app.cron.scan.api_livre;

  async function fetchPayDates() {
    const conf = ggc();
    let paydates = await app.db("ticket").where({ ticket_url: null });

    let customersWhoMustPay = [];
     paydates.map(e => {
      let m = []
       for(let x = 0; x < conf.app.DATGENTICKET; x++ ) {
       m[x] = moment(new Date(e.paydate));
       m[x].subtract(x, "days");       
        if (moment().isSame(m[x], "day")) {
          customersWhoMustPay.push({ cnpjcpf: e.cnpjcpf, paydate: e.paydate });
          break;
        }
       }
    });
    
    return customersWhoMustPay;
  }

  async function generateTicketsForCustomers(customers) {
    const conf = ggc();
    customers.forEach( async e => {
      const dataCustomer = await app.db.select(`
        customers.cnpjcpf`, `nameaccount`,
        `email`, 'cep',
        'state', 'customers.type',
        'logradouro', 'number',
        'complement', 'city',
        'baseval', 'telefone'
      )
      .from("customers")
      .fullOuterJoin('billing', 'customers.cnpjcpf', 'billing.cnpjcpf')
      .fullOuterJoin('contacts', 'customers.cnpjcpf', 'contacts.cnpjcpf')
      .where({"customers.cnpjcpf": e.cnpjcpf}).first();
      const pd = moment(e.paydate).format("DD-MM-YYYY");
      const SAC_DATA = {
        FMTOUT: "JSON",
        USRKEY: conf.api.USER_KEY,
        NOMSAC: dataCustomer.nameaccount,
        SACMAL: dataCustomer.email,
        CODCEP: dataCustomer.cep,
        CODUFE: dataCustomer.state,
        DSCEND: `${dataCustomer.type}. ${dataCustomer.logradouro}`,
        NUMEND: dataCustomer.number,
        DSCCPL: dataCustomer.complement,
        DSCBAI: "",
        DSCCID: dataCustomer.city,
        NUMPAI: "",
        CODOPR: "",
        NUMDDD: "",
        NUMTEL: "",
        CODCMF: dataCustomer.cnpjcpf,
        CALMOD: "1",
        DATVCT: pd,
        VLRBOL: dataCustomer.baseval,
        PCTJUR: conf.api.PCTJUR,
        DATVAL: pd
      };

      // Request to api-livre
      //  const ticket_param = await generateTicket(token, SAC_DATA);
      const ticket_param = '?vl=f703655c-5f66-40ff-8f4e-0b4dfbe63a60'
      await app.db('ticket')
        .update({ ticket_url: `${conf.api.URLCONFAT}${ticket_param}`})
        .where({ cnpjcpf: dataCustomer.cnpjcpf })
        .then(_ => {
            console.log(_ );
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  return {
    fetchPayDates,
    generateTicketsForCustomers
  };
};
