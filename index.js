import dotenv from 'dotenv';
dotenv.config();
import moment from 'moment';
import Promise from 'bluebird';
import got from 'got';
import OVH from 'ovh';

let ovh = OVH({
  endpoint: process.env.APP_ENDPOINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY
});

let array_index = 0;
let invoices = [];

// This method allow to work synchronously and avoid flood and timeout issue
function getInfos(invoice) {
  return ovh.requestPromised('GET', `/me/bill/${invoice}`);
}

ovh.request(
  'GET',
  `/me/bill?date.from=${moment().subtract(30, 'days').format('YYYYMMDD')}`,
  function (err, invoices) {
    Promise.resolve(invoices).map(getInfos).then(console.log);
  }
);
