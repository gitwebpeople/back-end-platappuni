
// exports.seed = function(knex, Promise) {
//   // Deletes ALL existing entries
//   return knex('table_name').del()
//     .then(function () {
//       // Inserts seed entries
//       return knex('table_name').insert([
//         {id: 1, colName: 'rowValue1'},
//         {id: 2, colName: 'rowValue2'},
//         {id: 3, colName: 'rowValue3'}
//       ]);
//     });
// };
const path = require('path');

const transformer = require('knex-csv-transformer').transformer;
const transfomerHeader = require('knex-csv-transformer').transfomerHeader;

exports.seed = transformer.seed({
  table: 'customers',
  file: path.join(__dirname, '../csv/clientes.csv'),
  transformers: [
    transfomerHeader('Nome da conta', 'nameaccount'),
    transfomerHeader('CNPJ/CPF', 'cnpjcpf'),
    transfomerHeader('Data de cadastro', 'registerdate'),
    transfomerHeader('PJ/PF', 'pjpf'),
    transfomerHeader('tipo', 'type'),
    transfomerHeader('Logradouro', 'logradouro'),
    transfomerHeader('Numero', 'number'),
    transfomerHeader('Complemento', 'complement'),
    transfomerHeader('CEP', 'cep'),
    transfomerHeader('Estado', 'state'),
    transfomerHeader('Município', 'city')
    // transfomerHeader('Date', 'time', function(value) {
    //   return new moment(value, "DD/MM/YYYY").format('YYYY-MM-DDT00:00:00');
    // })
  ]
});