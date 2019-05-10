const moment = require("moment")
module.exports = app => {
    async function fetchPayDates(){
        let paydates = await app.db("ticket").where({ ticket_url: null });
        
        let customersWhoMustPay = []
        paydates = paydates.map(e => {
            const m = moment(new Date(e.paydate))
            const payday = m.subtract(7, 'days')
            
            if(moment().isSame(payday, 'day')) {
                customersWhoMustPay.push({ cnpjcpf: e.cnpjcpf });
            }
        });


        console.log(customersWhoMustPay);        
    }


    return {
        fetchPayDates
    }
}