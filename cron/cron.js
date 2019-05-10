module.exports = app => {
    const { fetchPayDates } = app.cron.scan.ticket;
    function startJobGenerateTickets() {
        var CronJob = require('cron').CronJob;
        new CronJob('*/5 * * * * *', function() {
            fetchPayDates();
        }, null, true, 'America/Sao_Paulo');
    }

    return {
        startJobGenerateTickets
    }
}