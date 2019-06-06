const env = require('./.env')

// module.exports = {
//   client: 'postgresql',
//   connection: {
//     database: 'appsys-idc',
//     user: 'appdbaws',
//     password: 'zw44V&1n',
//     host: 'plesk-web-a.appuni.com.br',
//     port: ''
//   }
// }
module.exports = {
  client: 'postgresql',
  connection: {
    host: env.host,
    database: env.database,
    user: env.user,
    password: env.password,
    port: env.port
  }
}
