const { authSecret } = require('../../.env')
const jwt = require('jwt-simple')

module.exports = app => {
  const {
    existsOrError
  } = app.components.validation
  const updateCustomerData = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const body = req.body.payload || null

    try {
      existsOrError(body.email, 'Você não informou um e-mail principal')
      existsOrError(body.nome, 'Você não informou o nome da conta')
      existsOrError(body.logradouro, 'você não informou o logradouro')
      existsOrError(body.numero, 'Você não informou o número')
      existsOrError(body.cep, 'Você não informou o cep')
      existsOrError(body.estado, 'Você não informou o estado')
      existsOrError(body.cidade, 'Você não informou a cidade')
      existsOrError(body.comercial, 'Você não informou ao menos um contato comercial')
      existsOrError(body.celular, 'Você deve informar ao menos um número de celular')
    } catch (msg) {
      return res.status(400).send(msg)
    }

    const email = await app.db.select('email').from('customers').where({ id: user.id })

    if (email) return res.status(400).send('Este e-mail já está sendo usado por outro usuário')

    app
      .db('customers')
      .where({
        cnpjcpf: user.cnpjcpf,
        id: user.id
      })
      .update({
        nameaccount: body.nome,
        logradouro: body.logradouro,
        number: body.numero,
        cep: body.cep,
        state: body.estado,
        city: body.cidade,
        comercial: body.comercial,
        comercial2: body.comercial2,
        celular: body.celular,
        celular2: body.celular2,
        complement: body.complemento,
        email: body.email
      })
      .then(_ => {
        return res.sendStatus(200)
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
      .where({ cnpjcpf: user.cnpjcpf }).first()
    return res.json(customer)
  }
  const alreadyUpdatedData = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const result = await app.db.select('updated_data').from('customers').where({ cnpjcpf: user.cnpjcpf })

    return res.json(result)
  }

  return {
    alreadyUpdatedData,
    selectCustomerData,
    updateCustomerData
  }
}
