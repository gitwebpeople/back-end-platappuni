const path = require('path')
const hbs = require('nodemailer-express-handlebars')

const email = process.env.MAILER_EMAIL_ID || 'appuni-sys@appuni.net'
const pass = process.env.MAILER_PASSWORD || 'H66d0qf!'
const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
  // service: process.env.MAILER_SERVICE_PROVIDER || "Gmail",
  host: 'smarter-email-a.appuni.com.br',
  port: 587,
  secure: true,
  auth: {
    user: email,
    pass: pass
  }
})

const handlebarsOptions = {
  viewEngine: {
    extName: 'handlebars',
    partialsDir: path.resolve('../../templates/email/'),
    layoutsDir: path.resolve('../../templates/email/partials'),
    defaultLayout: 'template'
  },
  viewPath: path.resolve('../../templates/email'),
  extName: '.html'
}
smtpTransport.use('compile', hbs(handlebarsOptions))

module.exports = smtpTransport
