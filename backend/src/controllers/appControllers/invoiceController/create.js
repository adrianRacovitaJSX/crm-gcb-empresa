const mongoose = require('mongoose');
const Model = mongoose.model('Invoice');
const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0, recargo = 0 } = value;
  
   // default
   let recargoTotal = 0;
   let subTotal = 0;
   let taxTotal = 0;
   let total = 0;
   let recargoValue = 0;
   let taxValue = 0;
   let currentTotal = 0;

   // Calculate the items array with subTotal, total, taxTotal
   items.map((item) => {
     let total = calculate.multiply(item['quantity'], item['price']);
     //sub total
     subTotal = calculate.add(subTotal, total);
     //item total
     item['total'] = total;
   });

   // Calculate taxValue based on subTotal and taxRate
   taxValue = calculate.multiply(subTotal, taxRate / 100);

   // Calculate recargoValue based on subTotal and recargo (5.2%)
   recargoValue = calculate.multiply(subTotal, recargo / 100);

   // Calculate currentTotal by adding subTotal and taxValue
   currentTotal = calculate.add(subTotal, taxValue);

   // Calculate total by adding currentTotal and recargoValue
   total = calculate.add(currentTotal, recargoValue).toFixed(2) / 1;

   body['subTotal'] = subTotal;
   body['taxTotal'] = taxValue; // Store taxValue as taxTotal
   body['taxValue'] = taxValue;
   body['currentTotal'] = currentTotal;
   body['recargoTotal'] = recargoValue; // Store recargoValue as recargoTotal
   body['recargoValue'] = recargoValue;
   body['total'] = total;
   body['items'] = items;


  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin._id;

  const result = await new Model(body).save();
  const fileId = 'fact-' + result.number + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();

  increaseBySettingKey({ settingKey: 'last_invoice_number' });

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Factura creada',
  });
};

module.exports = create;