/* eslint-disable no-console */
module.exports = app => {
    const { fetchPayDates, generateTicketsForCustomers } = app.cron.scan.ticket;
    const { getToken } = app.cron.scan.api_livre;

    function startJobGenerateTickets() {
        var CronJob = require('cron').CronJob;
        new CronJob('*/30 * * * * *', async function() {
          //getToken();
            const customersWhoMustPay = await fetchPayDates();
            generateTicketsForCustomers(customersWhoMustPay);
        }, null, true, 'America/Sao_Paulo');
    }

    return {
        startJobGenerateTickets
    }
}