const { authSecret } = require('../../.env')
const jwt = require('jwt-simple')

module.exports = app => {
  const { existsOrError } = app.components.validation
  const { registerUserLogActivity } = app.components.security

  const updateCustomerData = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const body = req.body.payload || null

    const { registerUserLogActivity } = app.components.security

    try {
      existsOrError(body.nameAccount, 'Você não informou o nome da conta')
      existsOrError(body.responsavel, 'Você não informou um responsável pela conta')
      existsOrError(body.logradouro, 'você não informou o logradouro')
      existsOrError(body.numero, 'Você não informou o número')
      existsOrError(body.cep, 'Você não informou o cep')
      existsOrError(body.estado, 'Você não informou o estado')
      existsOrError(body.cidade, 'Você não informou a cidade')
      existsOrError(
        body.comercial,
        'Você não informou ao menos um contato comercial'
      )
      existsOrError(
        body.celular,
        'Você deve informar ao menos um número de celular'
      )
    } catch (msg) {
      return res.status(400).send(msg)
    }

    // const email = await app.db
    //   .select('email')
    //   .from('customers')
    //   .where({ id: user.id })

    // if (email) {
    //   return res
    //     .status(400)
    //     .send('Este e-mail já está sendo usado por outro usuário')
    // }

    app
      .db('customers')
      .where({
        cnpjcpf: user.cnpjcpf,
        id: user.id
      })
      .update({
        nameaccount: body.nameAccount,
        responsavel: body.responsavel,
        logradouro: body.logradouro,
        number: body.numero,
        cep: body.cep,
        state: body.estado,
        city: body.cidade,
        comercial: body.comercial,
        comercial2: body.comercial2,
        celular: body.celular,
        celular2: body.celular2,
        complement: body.complemento
      })
      .then(async _ => {
        try {
          await registerUserLogActivity({
            id: user.id,
            activity: 'Atualizou informações da conta',
            ip: req.body.payload.ip,
            date: req.body.payload.logDate
          })
          return res.sendStatus(200)
        } catch (msg) {
          console.log(msg)
          return res.status(200).send(msg)
        }
      })
      .catch(err => {
        return res.status(500).send(err)
      })
  }

  const selectCustomerData = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const customer = await app
      .db('customers')
      .where({ cnpjcpf: user.cnpjcpf })
      .first()
    return res.json(customer)
  }
  const alreadyUpdatedData = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const result = await app.db
      .select('updated_data')
      .from('customers')
      .where({ cnpjcpf: user.cnpjcpf })

    return res.json(result)
  }

  const changePasswordFromPanel = async (req, res) => {
    const customerData = jwt.decode(req.get('Authorization').replace('bearer ', ''), authSecret);
    const {password, confirmPassword} = req.body.payload;

    if(password == confirmPassword) {
      
      try {
        await registerUserLogActivity({
          id: customerData.id,
          activity: 'alterar senha pelo painel',
          ip: req.body.payload.ip,
          date: req.body.payload.logDate
        })
        app.db('customers').update({ password }).where({ cnpjcpf: customerData.cnpjcpf })
        .then(r => {
          return res.send(true);
        })
        .catch(err => {
          return res.send(err).status(500)
        })
      } catch (msg) {
        console.log(msg)
        return res.status(500).send(msg)
      }
     
    } else {
      return res.json({ message: "As senhas não coincidem"});
    }
    
  }

  return {
    alreadyUpdatedData,
    selectCustomerData,
    updateCustomerData,
    changePasswordFromPanel
  }
}
