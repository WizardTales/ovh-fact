import dotenv from 'dotenv';
dotenv.config();
import moment from 'moment';
import { promises as fs } from 'fs';
import Promise from 'bluebird';
import got from 'got';
import OVH from 'ovh';
import { FormData, File, Blob } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { Client } from '@elbstack/lexoffice-client-js';

const client = new Client(process.env.LEXOFFICE);

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

const auth = { Authorization: `Bearer ${process.env.LEXOFFICE}` };

ovh.request(
  'GET',
  `/me/bill?date.from=${moment().subtract(30, 'days').format('YYYYMMDD')}`,
  function (err, invoices) {
    Promise.resolve(invoices)
      .map(getInfos)
      .map(async x => {
        const pdf = await got(x.pdfUrl, { responseType: 'buffer' });
        return { ...x, pdf: pdf.body };
      })
      .map(async x => {
        await fs.writeFile(`/tmp/__billxm__${x.billId}.pdf`, x.pdf);

        const form = new FormData();
        form.set('file', await fileFromPath(`/tmp/__billxm__${x.billId}.pdf`));
        form.set('type', 'voucher');
        //return client.uploadFile(form);

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

        return got(
          //`https://api.lexoffice.io/v1/vouchers/${voucher.body.id}/files`,
          'https://api.lexoffice.io/v1/files',
          {
            method: 'POST',
            headers: auth,
            body: form
          }
        );
      })
      .catch(x => {
        console.log(x);
        console.log('h', x.response.body);
      })
      .then(console.log);
  }
);
