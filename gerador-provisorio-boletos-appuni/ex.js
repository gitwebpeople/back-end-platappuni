const sendMail = require('../components/email/index')
const { getToken, generateTicket } = require('../components/ticket/index')

// console.log(template, sendMail)
start()
async function start () {
  const token = await getToken()
  const ticket = await generateTicket(token, {
    customer: 'Andsu',
    email: 'anderson@hotmail.com',
    valbol: 40,
    pd: '20/06/2019',
    cnpjcpf: '00.696.813/0001-68'
  })

  const template = {
    name: 'fatura-pj',
    context: {
      boleto: `http://fatura2.livre.com.br/fatura${ticket}`,
      nfe: `https://facebook.com`
    }
  }

  const emailData = {
    to: 'andersonjulio15@gmail.com',
    from: 'financeiro@appuni.com.br',
    bcc: 'biellcrazy@gmail.com',
    subject: 'Renovação Appuni'
  }

  sendMail(template, emailData)

  console.log(ticket)
}
