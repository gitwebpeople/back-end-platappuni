const sendMail = require('../components/email/index')
const smtpConfig = require('../components/email/config')
const path = require('path')
const qs = require('querystring')
const config = require('../knexfile.js')
const knex = require('knex')(config)
const { getToken, generateTicket } = require('../components/ticket')

const email = process.env.MAILER_EMAIL_ID || 'financeiro@appuni.com.br'
const pass = process.env.MAILER_PASSWORD || '@hKFOl0@$2hKSQW!'
const smtpTransport = smtpConfig(
  {
    smtpServer: 'smtp.office365.com',
    port: 587,
    ssl: false,
    email,
    pass
  },
  path.join(__dirname, '../templates/email/'),
  path.join(__dirname, '../templates/email/partials')
)

start()
async function start () {
  const customers = await knex('customer_manually').where({ finished: false })
  const { test, teste } = false // false para teste -- true para produção
  const finished = true // true para produção -- false para teste
  const pd = '01/07/2019' // data de validade
  const nfFolder = '07/05' // caminho para NFe no servidor
  for (let x = 0; x < customers.length; x++) {
    const customer = customers[x]
    console.log(x)
    const token = await getToken()
    const ticket = await generateTicket(token, {
      ...customers[x],
      pd,
      email: customers[x].contacts.split(';')[0].replace(/\s/g, '')
    })
    const generated = !!ticket

    await knex('manually_generated_tickets').insert({
      cnpjcpf: customer.cnpjcpf,
      customer: customer.customer,
      teste,
      generated,
      type: customer.type,
      email: customer.contacts,
      val_ticket: customer.valbol,
      ticket_url: ticket
    })

    const template = {
      name: customers[x].type == 'PJ' ? 'fatura-pj' : 'fatura-pf',
      context:
        customers[x].type == 'PJ'
          ? {
            boleto: `http://fatura2.livre.com.br/FaturaBradesco?vl={${
              qs.parse(ticket.substr(1, ticket.length)).vl
            }}`,
            nfe: `http://painel.appuni.com.br/financeiro/notas fiscais/2019/${nfFolder}/${customers[x]
              .cnpjcpf.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')}.pdf`
          }
          : {
            boleto: `http://fatura2.livre.com.br/FaturaBradesco?vl={${
              qs.parse(ticket.substr(1, ticket.length)).vl
            }}`
          }
    }

    const emailData = {
      to: customers[x].contacts,
      from: 'financeiro@appuni.com.br',
      bcc: 'financeiro@appuni.com.br',
      subject: 'Appuni - Renovação de serviços'
    }

    try {
      const mailResponse = await sendMail(template, emailData, smtpTransport)
      await knex('customer_manually')
        .update({ finished })
        .where({ id: customer.id })
      await knex('sended_email_logs').insert({
        cnpjcpf: customer.cnpjcpf,
        ticket: customer.ticket_url,
        email: customer.contacts,
        sended: true,
        msg: mailResponse,
        test
      })

      console.log(customers[x].customer, {
        boleto: ticket,
        email: mailResponse
      })
    } catch (msg) {
      await knex('sended_email_logs').insert({
        cnpjcpf: customer.cnpjcpf,
        ticket: customer.ticket_url,
        email: customer.contacts,
        sended: false,
        error: msg,
        test
      })
      console.log(customers[x].customer, {
        boleto: ticket,
        email: msg
      })
    }
  }
}
