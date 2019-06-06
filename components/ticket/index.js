const jwt = require('jwt-simple')
const { authSecret } = require('../../.env')
const moment = require('moment')

module.exports = app => {
  async function getProductTickets (req, res) {
    const tokenHeader = req.get('Authorization')
    const idProd = req.query.idProd
    const cd = jwt.decode(tokenHeader.replace('bearer ', ''), authSecret)

    const data = await app
      .db('ticket')
      .where({ cnpjcpf: cd.cnpjcpf, idbilling: idProd })

    return res.json(data)
  }
  async function getCustomerTickets (req, res) {
    const token_header = req.get('Authorization')
    // custumer data
    const cd = jwt.decode(token_header.replace('bearer ', ''), authSecret)

    const tickets = await app
      .db('ticket')
      .where({ cnpjcpf: cd.cnpjcpf, generated: false })

    return res.json(tickets)
  }

  function payTicket (req, res) {
    const cd = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const today = moment()
    const request_data = {
      NIDBOL: 21312,
      KEYBOL: 'f703655c-5f66-40ff-8f4e-0b4dfbe63a60',
      DATPGT: today,
      VLRPAG: 152.52,
      STABOL: 2
    }

    app
      .db('ticket')
      .update({
        status_payment: request_data.STABOL,
        date_payment: request_data.DATPGT,
        payment_value: request_data.VLRPAG,
        id_bol: request_data.NIDBOL
      })
      .where({
        cnpjcpf: cd.cnpjcpf
      })
      .then(_ => {
        console.log(_)

        return res.sendStatus(200)
      })
      .catch(error => {
        console.log(error)

        return res.json(error)
      })
  }

  return {
    getCustomerTickets,
    getProductTickets,
    payTicket
  }
}
