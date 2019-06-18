const sendMail = require('../components/email/index')

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
  const re = await sendMail(template, emailData)
  console.log(re)
}
