const path = require('path')

var hbs = require('nodemailer-express-handlebars')
var email = process.env.MAILER_EMAIL_ID || 'biellcrazy@gmail.com'
var pass = process.env.MAILER_PASSWORD || 'gabrieldopc'
const nodemailer = require('nodemailer')

var smtpTransport = nodemailer.createTransport({
  // service: process.env.MAILER_SERVICE_PROVIDER || "Gmail",
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '0746f45f10ccf3',
    pass: 'd48404afcf0b99'
  }
})

var handlebarsOptions = {
  viewEngine: {
    extName: 'handlebars',
    partialsDir: path.resolve('../templates/email/'),
    layoutsDir: path.resolve('../templates/email/partials'),
    defaultLayout: 'template'
  },
  viewPath: path.resolve('../templates/email'),
  extName: '.html'
}

smtpTransport.use('compile', hbs(handlebarsOptions))

module.exports = function sendTicketToMail (c, knex) {
  var data = {
    to: c.mail,
    from: email,
    template: 'forgot-password-email',
    subject: 'Sua fatura Appuni chegou',
    context: {
      boleto:
        'http://localhost:3000/auth/reset_password?token=' + c.cnpjcpf + '.pdf',
      nfe: c.ticketUrl
    }
  }

  smtpTransport.sendMail(data, async function (err, info) {
    console.log(err, info)
    if (!err) {
      await knex('tabela com logs de envio')
        .insert({
          cnpjcpf: c.cnpjcpf,
          ticket: c.ticketUrl,
          email: c.mail,
          send: true
        })
        .then(_ => {
          return true
        })
        .catch(error => {
          throw error.message
        })
    } else {
      await knex('tabela com logs de envio')
        .insert({
          cnpjcpf: c.cnpjcpf,
          ticket: c.ticketUrl,
          email: c.mail,
          send: false,
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
