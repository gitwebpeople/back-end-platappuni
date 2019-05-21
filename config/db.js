const config = require('../knexfile.js');
const knex  = require('knex')(config)

knex.migrate.latest([config]);
// knex.seed.run([config])
module.exports = knex;