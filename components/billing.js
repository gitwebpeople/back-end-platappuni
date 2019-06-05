const jwt = require('jwt-simple')
const { authSecret } = require('../.env')

module.exports = app => {
  async function getCustomerProducts (req, res) {
    const dC = jwt.decode(
      req.get('Authorization').replace('bearer ', ''),
      authSecret
    )
    const cP = await app.db('billing').where({ cnpjcpf: dC.cnpjcpf })

    return res.json(cP)
  }

  return { getCustomerProducts }
}
