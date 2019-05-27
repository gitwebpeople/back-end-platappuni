const app = require('express')()
const http = require('http').Server(app)

const consign = require('consign')

const port = process.env.PORT || 4000

const db = require('./config/db')

app.db = db

consign()
  .then('./config/middleware.js')
  .include('./config/passport.js')
  .then('./cron/scan/api_livre.js')
  .then('./cron/scan/ticket.js')
  .then('./cron/cron.js')
  .then('./components/ticket')
  .then('./components/validation.js')
  .then('./components/security.js')
  .then('./components/customers/auth.js')
  .then('./components/customers/register.js')
  .then('./components/customers/customerData.js')
  .then('./components/contacts.js')
  .then('./config/routes.js')
  .into(app)

http.listen(port, () => {
  console.log('iniciando servidor backend...' + port)
})

app.cron.cron.startJobGenerateTickets()
