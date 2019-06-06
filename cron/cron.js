/* eslint-disable no-console */
module.exports = app => {
  const { fetchPayDates, generateTicketsForCustomers } = app.cron.scan.ticket
  function startJobGenerateTickets () {
    var CronJob = require('cron').CronJob
    new CronJob(
      '*/30 * * * * *',
      async function () {
        const customersWhoMustPay = await fetchPayDates()
        generateTicketsForCustomers(customersWhoMustPay)
      },
      null,
      true,
      'America/Sao_Paulo'
    )
  }

  return {
    startJobGenerateTickets
  }
}
