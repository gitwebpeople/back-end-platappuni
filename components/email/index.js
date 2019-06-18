const smtpTransport = require('./config')

module.exports = async function sendMail (template, emailData) {
  const data = {
    to: emailData.to,
    from: emailData.from,
    bcc: emailData.bcc,
    template: template.name,
    subject: emailData.subject,
    context: template.context
  }

  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(data, function (err, info) {
      // console.log(err, info)
      if (!err) {
        resolve(info)
      } else {
        reject(err)
      }
    })
  })
}
