
const path = require('path');

const transformer = require('knex-csv-transformer').transformer;
const transfomerHeader = require('knex-csv-transformer').transfomerHeader;

exports.seed = transformer.seed({
  table: 'billing',
  file: path.join(__dirname, '../csv/billing.csv'),
  transformers: [
    transfomerHeader('CPF/CNPJ', 'cnpjcpf'),
    transfomerHeader('Produto', 'product'),
    transfomerHeader('Vl. Base R$', 'baseval'),
    transfomerHeader('Vl. Retenção R$', 'retval'),
    transfomerHeader('Período', 'period'),
    // transfomerHeader('Date', 'time', function(value) {
    //   return new moment(value, "DD/MM/YYYY").format('YYYY-MM-DDT00:00:00');
    // })
  ]
});
