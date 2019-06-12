const path = require('path')
const qs = require('querystring')

var hbs = require('nodemailer-express-handlebars')
var email = process.env.MAILER_EMAIL_ID || 'appuni-sys@appuni.net'
var pass = process.env.MAILER_PASSWORD || 'Gl28mo0!'
const nodemailer = require('nodemailer')

var smtpTransport = nodemailer.createTransport({
  // service: process.env.MAILER_SERVICE_PROVIDER || "Gmail",
  host: 'smarter-email-a.appuni.com.br',
  port: 2525,
  auth: {
    user: email,
    pass: pass
  }
})

var handlebarsOptions = {
  viewEngine: {
    extName: 'handlebars',
    partialsDir: path.resolve('./templates/email/'),
    layoutsDir: path.resolve('./templates/email/partials'),
    defaultLayout: 'template'
  },
  viewPath: path.resolve('./templates/email'),
  extName: '.html'
}

smtpTransport.use('compile', hbs(handlebarsOptions))

module.exports = function sendTicketToMail(c, knex, type) {
  const u = c.ticketUrl
  if(type == 'PF'){
    var data = {
      to: c.email,
      from: email,
      template: 'fatura-pf',
      subject: 'Sua fatura Appuni chegou',
      context: {
        boleto: `http://fatura2.livre.com.br/FaturaBradesco?vl={${qs.parse(u.substr(1,u.length)).vl}}`
      }
    }
  } else {
    var data = {
      to: c.email,
      from: email,
      template: 'fatura-pj',
      subject: 'Sua fatura Appuni chegou',
      context: {
        nfe:
          'http://painel.appuni.com.br/financeiro/notas fiscais/2019/06/15/' +
          c.cnpjcpf.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") +
          '.pdf',
        boleto: `http://fatura2.livre.com.br/FaturaBradesco?vl={${qs.parse(u.substr(1,u.length)).vl}}`
      }
    }
  }

  smtpTransport.sendMail(data, async function(err, info) {
    console.log(err, info)
    if (!err) {
      await knex('sended_email_logs')
        .insert({
          cnpjcpf: c.cnpjcpf,
          ticket: c.ticketUrl,
          email: c.mail,
          sended: true,
          msg: info
        })
        .then(_ => {
          return true
        })
        .catch(error => {
          throw error.message
        })
    } else {
      await knex('sended_email_logs')
        .insert({
          cnpjcpf: c.cnpjcpf,
          ticket: c.ticketUrl,
          email: c.mail,
          sended: true,
          error: err
        })
        .then(_ => {
          return true
        })
        .catch(error => {
          throw error.message
        })
    }
  })
}
