const path = require('path')
const qs = require('querystring')
const config = require('../knexfile.js')
const knex = require('knex')(config)
var hbs = require('nodemailer-express-handlebars')
var email = process.env.MAILER_EMAIL_ID || 'financeiro@appuni.com.br'
var pass = process.env.MAILER_PASSWORD || 'Lub75657'
const nodemailer = require('nodemailer')

var smtpTransport = nodemailer.createTransport({
  // service: process.env.MAILER_SERVICE_PROVIDER || "Gmail",
  host: 'smtp.office365.com',
  port: 587,
  auth: {
    user: email,
    pass: pass
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

getTicketsToDispatch();

async function getTicketsToDispatch () {
  let a = 0
  const c = await knex('manually_generated_tickets').where({ teste: false, generated: true, type: "PF" });
  //console.log(c)
  (function myLoop (i) {          
    setTimeout(function () { 
      sendTicketToMail(c[a], 'PF')         //  your code here                
      a++
      if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
    }, 3000)
   })(c.length);
}

function sendTicketToMail(c, type) {
  const u = c.ticket_url;
  const emails = c.email.replace(';', ',')
  if(type == 'PF'){
    var data = {
      to: emails,
      from: "financeiro@appuni.com.br",
      bcc: "renan@webpeople.net.br,gabriel.n64@hotmail.com",
      template: 'fatura-pf',
      subject: 'Appuni - Renovação de serviços',
      context: {
        boleto: `http://fatura2.livre.com.br/FaturaBradesco?vl={${qs.parse(u.substr(1,u.length)).vl}}`
      }
    }
  } else {
    var data = {
      to: emails,
      from: "financeiro@appuni.com.br",
      bcc: "renan@webpeople.net.br,gabriel.n64@hotmail.com,hcmilanez@appuni.com.br",
      template: 'fatura-pj',
      subject: 'Appuni - Renovação de serviços',
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
    console.log("--------");
    
    if (!err) {
      await knex('sended_email_logs')
        .insert({
          cnpjcpf: c.cnpjcpf,
          ticket: c.ticket_url,
          email: emails,
          sended: true,
          msg: info,
          test: true
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
          ticket: c.ticket_url,
          email: c.email,
          sended: true,
          error: err,
          test: true
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
