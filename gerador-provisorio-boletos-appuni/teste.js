const qs = require('querystring')
const u = '?vl=0d23eb3b-8b54-4f1e-8d0d-0dbae2c8d7c0'
console.log(qs.parse(u.substr(1,u.length)).vl)