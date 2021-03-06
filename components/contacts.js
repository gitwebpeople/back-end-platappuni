const { authSecret } = require('../.env')
const jwt = require('jwt-simple')

module.exports = app => {
  const { existsOrError } = app.components.validation
  const { registerUserLogActivity } = app.components.security

  const registerNewContact = async (req, res) => {
    const data = req.body.payload || null

    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const id = user.id
    const cnpjcpf = user.cnpjcpf

    if (id) {
      const customer = await app.db('customers').where({ id })
      if (!customer) {
        return res.status(400).send('Usuário não encontrado.')
      }
    } else {
      return res.status(500).send('ID não informado.')
    }

    const telefone = await app
      .db('contacts')
      .where({ cnpjcpf, telefone: req.body.payload.telefone })
      .first()
    console.log(telefone)
    if (telefone) {
      return res.status(400).send('Você já cadastrou este telefone.')
    }

    const email = await app
      .db('contacts')
      .where({ cnpjcpf, contact: req.body.payload.email })
      .first()
    if (email) return res.status(400).send('Você já cadastrou este email.')

    try {
      existsOrError(
        data.nome,
        'Você precisa informar um nome para este contato.'
      )
      existsOrError(
        data.telefone,
        'Você precisa informar um telefone para este contato.'
      )
      existsOrError(
        data.email,
        'Você precisa informar um e-mail para este contato.'
      )
    } catch (msg) {
      return res.status(400).send(msg)
    }

    try {
      await registerUserLogActivity({
        id: user.id,
        activity: 'Inserindo novo contato',
        ip: req.body.payload.ip,
        date: req.body.payload.logDate
      })
      app
        .db('contacts')
        .insert({
          id_cliente: id,
          cnpjcpf,
          nome: data.nome,
          telefone: data.telefone,
          contact: data.email,
          type: data.type
        })
        .then(_ => {
          return res.sendStatus(200)
        })
        .catch(err => {
          return res.status(500).send(err)
        })
    } catch (msg) {
      console.log(msg)
      return res.status(200).send(msg)
    }
  }

  const updateContact = async (req, res) => {
    const data = req.body.payload || null

    const token = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )

    const user = await app
      .db('customers')
      .where({ id: token.id })
      .first()

    const result = await app
      .db('contacts')
      .where({ id: data.id })
      .first()

    if (!result) {
      return res
        .status(500)
        .send(
          'Não encontramos este contato que está tentando alterar. Entre em contato com o suporte.'
        )
    }

    try {
      existsOrError(
        data.nome,
        'Você precisa informar um nome para este contato.'
      )
      existsOrError(
        data.telefone,
        'Você precisa informar um telefone para este contato.'
      )
      existsOrError(
        data.email,
        'Você precisa informar um e-mail para este contato.'
      )
    } catch (msg) {
      return res.status(400).send(msg)
    }

    try {
      await registerUserLogActivity({
        id: user.id,
        activity: 'Atualizando contatos',
        ip: req.body.payload.ip,
        date: req.body.payload.logDate
      })
      app
        .db('contacts')
        .where({ id: data.id })
        .update({
          nome: data.nome,
          telefone: data.telefone,
          contact: data.contact
        })
        .then(_ => {
          return res.sendStatus(200)
        })
        .catch(err => {
          return res.status(500).send(err)
        })
    } catch (msg) {
      return res.status(200).send(msg)
    }
  }

  const fetchContacts = async (req, res) => {
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )

    const contacts = await app
      .db('contacts')
      .where({ cnpjcpf: user.cnpjcpf, id_cliente: user.id })

    return res.json(contacts)
  }

  const fetchContactsByType = async (req, res) => {
    const type = req.query.type || null
    const user = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )

    console.log(type)

    const contacts = await app
      .db('contacts')
      .where({ cnpjcpf: user.cnpjcpf, id_cliente: user.id, type })

    return res.json(contacts)
  }

  return {
    registerNewContact,
    updateContact,
    fetchContacts,
    fetchContactsByType
  }
}
