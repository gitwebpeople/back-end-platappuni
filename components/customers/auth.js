const bcrypt = require('bcrypt-nodejs')
const { authSecret } = require('../../.env')
const jwt = require('jwt-simple')
const crypto = require('crypto')
const async = require('async')
const path = require('path')

module.exports = app => {
  const { existsOrError, validarCNPJ, validateCPF } = app.components.validation

  const { registerUserLogActivity } = app.components.security

  const encryptPassword = password => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }
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
      partialsDir: path.resolve('./templates/email/'),
      layoutsDir: path.resolve('./templates/email/partials'),
      defaultLayout: 'template'
    },
    viewPath: path.resolve('./templates/email'),
    extName: '.html'
  }

  smtpTransport.use('compile', hbs(handlebarsOptions))

  const login = async (req, res) => {
    if (!req.body.payload.cnpjcpf || !req.body.payload.password) {
      return res.status(400).send('Informe usuário e senha!')
    }

    if (req.body.payload.cnpjcpf.length == 14) {
      if (!validarCNPJ(req.body.payload.cnpjcpf)) {
        return res.status(400).send('O CNPJ especificado é inválido.')
      }
    } else if (req.body.payload.cnpjcpf.length == 11) {
      if (!validateCPF(req.body.payload.cnpjcpf)) {
        return res.status(400).send('O CPF especificado é inválido.')
      }
    }

    const user = await app
      .db('customers')
      .where({ cnpjcpf: req.body.payload.cnpjcpf })
      .first()

    if (!user) return res.status(400).send('Usuário não encontrado!')

    // const isMatch = bcrypt.compareSync(req.body.payload.password, user.password);
    // if (!isMatch) return res.status(401).send("Email/Senha inválidos!");

    const now = Math.floor(Date.now() / 1000)

    const payload = {
      id: user.id,
      cnpjcpf: user.cnpjcpf,
      nick: user.nick,
      email: user.email,
      iat: now,
      exp: now + 60 * 60 * 24 * 365
      // exp: now + 1
    }

    try {
      await registerUserLogActivity({
        id: user.id,
        activity: 'login',
        ip: req.body.payload.ip,
        date: req.body.payload.logDate
      })
      return res.json({
        ...payload,
        token: jwt.encode(payload, authSecret)
      })
    } catch (msg) {
      return res.status(500).send(msg)
    }
  }

  function forgotPassword (req, res) {
    async.waterfall(
      [
        function (done) {
          app
            .db('customers')
            .where({ cnpjcpf: req.body.payload.cnpjcpf })
            .then(_ => {
              done(null, _[0])
            })
            .catch(err => {
              console.log('auth.js | line:107', err)
              return done('Usuário não encontrado.')
            })
        },
        function (user, done) {
          // create the random token

          crypto.randomBytes(20, function (err, buffer) {
            var token = buffer.toString('hex')
            done(err, user, token)
          })
        },
        function (user, token, done) {
          const now = Math.floor(Date.now() / 1000)
          app
            .db('customers')
            .where({ id: user.id })
            .update({
              reset_password_token: token,
              reset_password_expires: now + 60 * 60
            })
            .then(async _ => {
              const customer = await app.db('customers').where({ id: user.id })
              console.log(token)

              done(null, token, customer[0])
            })
            .catch(err => {
              console.log(err)
              // return done(err)
            })
          // User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true }).exec(function(err, new_user) {
          //   done(err, token, new_user);
          // });
        },
        function (token, user, done) {
          // const contact = await app.db.raw(
          //   `SELECT contact FROM contacts WHERE id_cliente = '${user.id}'`
          // );
          var data = {
            to: 'gabriel.n64@hotmail.com',
            from: email,
            template: 'forgot-password-email',
            subject: 'Password help has arrived!',
            context: {
              url: 'http://localhost:3000/auth/reset_password?token=' + token,
              name: user.nameaccount
            }
          }

          smtpTransport.sendMail(data, async function (err, info) {
            console.log(err, info)
            if (!err) {
              try {
                await registerUserLogActivity({
                  id: user.id,
                  activity: 'solicitação para redefinir senha',
                  ip: req.body.payload.ip,
                  date: req.body.payload.logDate
                })
                return res.json({
                  message:
                    'As instruções para redefinição de senha foram enviadas para seu e-mail. Por favor, cheque seu e-mail.'
                })
              } catch (msg) {
                console.log(msg)
                return res.status(200).send(msg)
              }
            } else {
              done(err, token, user)
            }
          })
        }
      ],
      function (err) {
        console.log('auth||line:170', err)
        return res.status(400).send(JSON.stringify(err))
      }
    )
  }
  async function resetPassword (req, res) {
    try {
      existsOrError(
        req.body.payload.newPassword,
        'Você precisa digitar uma senha nova.'
      )
      existsOrError(
        req.body.payload.verifyPassword,
        'Você precisa confirmar a sua nova senha.'
      )
    } catch (msg) {
      return res.status(400).send(msg)
    }

    const result = await app.db('customers').where({
      reset_password_token: req.body.payload.token
    })

    if (new Date(result[0].reset_password_expires * 1000) > new Date()) {
      // return res.send(false);
      if (req.body.payload.newPassword === req.body.payload.verifyPassword) {
        const password = encryptPassword(req.body.payload.newPassword)
        app
          .db('customers')
          .where({
            reset_password_token: req.body.payload.token
          })
          .update({
            reset_password_token: null,
            reset_password_expires: null,
            password: password
          })
          .then(_ => {
            var data = {
              to: 'gabriel.n64@hotmail.com',
              from: 'biellcrazy@gmail.com',
              template: 'reset-password-email',
              subject: 'Password Reset Confirmation',
              context: {
                name: result[0].nameaccount
              }
            }

            smtpTransport.sendMail(data, async function (err) {
              console.log(err)
              if (!err) {
                try {
                  const user = result[0]
                  await registerUserLogActivity({
                    id: user.id,
                    activity: 'resetPassword',
                    ip: req.body.payload.ip,
                    date: req.body.payload.logDate
                  })
                  return res.json({ message: 'Password reset' })
                } catch (msg) {
                  return res.status(200).send(msg)
                }
              } else {
                return res.status(500).send(err)
              }
            })
          })
          .catch(err => {
            return res.status(500).send(err)
          })
      } else {
        return res.status(400).send('As senhas não coincidem.')
      }
    } else {
      return res
        .status(400)
        .send('Token expirado, tente solicitar a alteração de senha novamente.')
    }
  }

  return {
    login,
    forgotPassword,
    resetPassword
  }
}
