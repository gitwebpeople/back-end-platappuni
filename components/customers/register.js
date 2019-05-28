const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
  const {
    existsOrError,
    validarCNPJ,
    validateCPF
  } = app.components.validation
  const encryptPassword = password => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }
  /*
      1. Cadastro PJ - Razão social, CNPJ e nome do responsável
      2. Cadastro PF – Nome completo e CPF
      3. Endereço – Preenchimento automático quando o cliente digitar o CEP
      4. Recuperação de senha – Envio de senha onde o cliente deverá acessar o link seguro para troca da senha
      5. Telefone comercial – Cadastro de 2 telefone
      6. Telefone celular – Cadastro de 2 telefone
      7. Data de cadastro

      logradouro, numero, complemento, cep, state, city, type (tipo de logradouro: rua, avenida...)
    */
  const registerCustomer = async (req, res) => {
    const data = req.body.payload
    try {
      existsOrError(data.cnpjcpf, 'Você não informou o CNPJ/CPF')
      existsOrError(data.email, 'Você não informou o e-mail')
      existsOrError(data.nameAccount, `Você não informou um nome para a conta`)

      if (data.cnpjcpf.length == 14) {
        if (!validarCNPJ(data.cnpjcpf)) { throw ('O CNPJ informado é inválido.') }
        data.pjpf = 'pj'
      } else if (data.cnpjcpf.length == 11) {
        if (!validateCPF(data.cnpjcpf)) { throw ('O CPF informado é inválido.') }
        data.pjpf = 'pf'
      } else {
        throw ('O documento informado é inválido.')
      }

      let nameAccount = ''
      let isPj = false
      if (data.pjpf == 'pf') {
        nameAccount = 'seu nome.'
      } else {
        isPj = true
        nameAccount = 'sua razão social.'
      }
      isPj
        ? existsOrError(data.responsavel, 'Você não informou o responsável')
        : ''
      existsOrError(data.logradouro, 'Você não informou o logradouro.')
      existsOrError(data.numero, 'Você não informou o número do logradouro.')
      existsOrError(data.cep, 'Você não informou o CEP.')
      existsOrError(data.state, 'Você não informou o estado.')
      existsOrError(data.city, 'Você não informou a cidade.')
      //existsOrError(data.type, 'Você não informou o tipo de logradouro.')
    } catch (msg) {
      return res.status(400).send(msg)
    }

    const customer = await app.db('customers').where({ cnpjcpf: data.cnpjcpf })

    if (customer.length > 0) { return res.status(400).send(`Já existe um usuário com este ${pjpf == 'pf' ? 'CPF' : 'CNPJ'}`) }

    const customerEmail = await app.db('customers').where({ email: data.email})

    if (customerEmail.length > 0) { return res.status(400).send('Já existe um usuário com este e-mail') }

    const d = new Date()
    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`

    const password = encryptPassword(data.password)

    const dataInsert = {
      nameaccount: data.nameAccount,
      responsavel: data.responsavel,
      cnpjcpf: data.cnpjcpf,
      registerdate: date,
      pjpf: data.pjpf,
      logradouro: data.logradouro,
      number: data.number,
      complement: data.complemento,
      cep: data.cep,
      state: data.state,
      city: data.city,
      type: data.type,
      comercial: data.comercial,
      comercial2: data.comercial2,
      celular: data.celular,
      celular2: data.celular2,
      password,
      email: data.email
    }

    app
      .db('customers')
      .insert(dataInsert)
      .then(_ => {

        return res.status(200)
      })
      .catch(error => {
        console.log(error)
        return res.status(500).send(error)
      })

  }
  return {
    registerCustomer
  }
}
