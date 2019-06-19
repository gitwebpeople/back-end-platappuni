const path = require('path')
const hbs = require('nodemailer-express-handlebars')

const nodemailer = require('nodemailer')

function config (emailConf, templatePath, templatePathPartials) {
  const smtpTransport = nodemailer.createTransport({
    // service: process.env.MAILER_SERVICE_PROVIDER || "Gmail",
    host: emailConf.smtpServer,
    port: emailConf.port,
    secure: !!emailConf.ssl,
    auth: {
      user: emailConf.email,
      pass: emailConf.pass
    }
  })

  const handlebarsOptions = {
    viewEngine: {
      extName: 'handlebars',
      partialsDir: templatePath,
      layoutsDir: templatePathPartials,
      defaultLayout: 'template'
    },
    viewPath: templatePath,
    extName: '.html'
  }
  smtpTransport.use('compile', hbs(handlebarsOptions))

  return smtpTransport
}

module.exports = config
