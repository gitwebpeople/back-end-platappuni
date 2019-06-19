const sendMail = require('../components/email/index')
const smtpConfig = require('../components/email/config')
const path = require('path')

const email = process.env.MAILER_EMAIL_ID || 'appuni-sys@appuni.net'
const pass = process.env.MAILER_PASSWORD || 'H66d0qf!'
const smtpTransport = smtpConfig(
  {
    smtpServer: 'smarter-email-a.appuni.com.br',
    port: 587,
    ssl: true,
    email,
    pass
  },
  path.join(__dirname,
    '../templates/email/'),
  path.join(__dirname,
    '../templates/email/partials')
)

const template = {
  name: 'fatura-pf',
  context: {
    boleto: `https://youtube.com`
  }
}

const emailData = {
  to: 'gabriel@webpeople.net.br',
  from: 'financeiro@appuni.com.br',
  bcc: 'gabriel.n64@hotmail.com',
  subject: 'Renovação Appuni'
}

// console.log(template, sendMail)
start()
async function start () {
  const re = await sendMail(template, emailData, smtpTransport)
  console.log(re)
}
