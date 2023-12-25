import dotenv from 'dotenv';
import moment from 'moment';
import { promises as fs } from 'fs';
import Promise from 'bluebird';
import got from 'got';
import OVH from 'ovh';
import { FormData, File, Blob } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import Module from 'node:module';
dotenv.config();
const require = Module.createRequire(import.meta.url);
const createdInvoices = require('./invoices.json');

const ovh = OVH({
  endpoint: process.env.APP_ENDPOINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY
});

const invoices = [];

// This method allow to work synchronously and avoid flood and timeout issue
function getInfos (invoice) {
  return ovh.requestPromised('GET', `/me/bill/${invoice}`);
}

const auth = { Authorization: `Bearer ${process.env.LEXOFFICE}` };

ovh.request(
  'GET',
  `/me/bill?date.from=${moment().subtract(70, 'days').toISOString()}`,
  function (err, invoices) {
    if (err) {
      throw err;
    }
    Promise.resolve(invoices)
      .map(getInfos, { concurrency: 2 })
      .map(async x => {
        const pdf = await got(x.pdfUrl, { responseType: 'buffer' });
        return { ...x, pdf: pdf.body };
      }, { concurrency: 2 }).filter(x => {
        if (createdInvoices[x.billId]) {
          return false;
        }

        return true;
      })
      .map(async x => {
        await fs.writeFile(`/tmp/__billxm__${x.billId}.pdf`, x.pdf);

        const form = new FormData();
        form.set('file', await fileFromPath(`/tmp/__billxm__${x.billId}.pdf`));
        form.set('type', 'voucher');
        // return client.uploadFile(form);

        // not available...
        // const voucher = await got('https://api.lexoffice.io/v1/vouchers', {
        //   responseType: 'json',
        //   method: 'POST',
        //   headers: auth,
        //   json: {
        //     type: 'purchaseinvoice',
        //     voucherNumber: x.billId,
        //     voucherDate: x.date,
        //     shippingDate: x.date,
        //     dueDate: x.date,
        //     totalGrossAmount: x.priceWithTax.value,
        //     totalTaxAmount: x.tax.value,
        //     taxType: 'gross',
        //     useCollectiveContact: false,
        //     contactId: '1bc53ad4-d9cd-4a54-aec7-cea2af110bb8',
        //     voucherItems: [
        //       {
        //         amount: x.priceWithTax.value,
        //         taxAmount: x.tax.value,
        //         taxRatePercent: 19,
        //         categoryId: 'b3a1f841-fd90-11e1-a21f-0800200c9a66'
        //       }
        //     ]
        //   }
        // });

        const res = await got(
          // `https://api.lexoffice.io/v1/vouchers/${voucher.body.id}/files`,
          'https://api.lexoffice.io/v1/files',
          {
            method: 'POST',
            headers: auth,
            body: form,
            retry: {
              limit: 3
            }
          }
        );

        createdInvoices[x.billId] = 1;

        return res;
      }, { concurrency: 2 })
      .catch(x => {
        console.log(x);
        console.log('h', x.response.body);
      })
      .then(x => {
        console.log(x, JSON.stringify(createdInvoices));

        return fs.writeFile('./invoices.json', JSON.stringify(createdInvoices), 'utf8');
      });
  }
);
