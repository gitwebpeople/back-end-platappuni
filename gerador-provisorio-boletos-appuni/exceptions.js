const config = require('../knexfile.js')
const knex = require('knex')(config)

getErrors()

async function getErrors() {
    const errors = await knex.raw(`select error from sended_email_logs where test = false and error != ''`);
    errors.rows.map(e => {
        const errorT = JSON.parse(e.error);
        console.log(errorT.response)
    })
    //console.log(errors.rows)
}