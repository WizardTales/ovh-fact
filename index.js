require('dotenv').config();
let https = require('https');
const moment = require('moment');

let ovh = require('ovh')({
  endpoint: process.env.APP_ENDPOINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY
});

let array_index = 0;
let invoices = [];

// This method allow to work synchronously and avoid flood and timeout issue
function getInfos(array_index, invoices) {
  if (array_index < invoices.length) {
    invoice = invoices[array_index];
    ovh.request('GET', `/me/bill/${invoice}`, function (err, file) {
      if (err == null) {
        console.log(
          invoice +
            ';' +
            file.pdfUrl +
            ';' +
            file.date +
            ';' +
            file.priceWithoutTax.value
        );
        array_index++;
        getInfos(array_index, invoices);
      }
    });
  }
}

ovh.request(
  'GET',
  `/me/bill?date.from=${moment().subtract(30, 'days').format('YYYYMMDD')}`,
  function (err, invoices) {
    getInfos(array_index, invoices);
  }
);
