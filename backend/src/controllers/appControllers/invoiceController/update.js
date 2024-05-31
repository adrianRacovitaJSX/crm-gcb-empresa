const mongoose = require('mongoose');
const Model = mongoose.model('Invoice');
const { calculate } = require('@/helpers'); // Assuming calculate helper provides functions
const schema = require('./schemaValidate');

const update = async (req, res) => {
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

  const previousInvoice = await Model.findOne({
    _id: req.params.id,
    removed: false,
  });

  const { credit } = previousInvoice;

  const { items = [], taxRate = 0, discount = 0, recargo = 0 } = req.body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  // Calculate subtotal directly from items
  let subTotal = 0;
  items.forEach((item) => {
    let totalItem = calculate.multiply(item['quantity'], item['price']);
    subTotal = calculate.add(subTotal, totalItem);
    item['total'] = totalItem;
  });

  // Calculate tax total based on subtotal and tax rate
  let taxTotal = calculate.multiply(subTotal, taxRate / 100);

  // Calculate recargo total based on subtotal and recargo rate
  let recargoTotal = calculate.multiply(subTotal, recargo / 100);

  // Calculate total with all components
  let total = calculate.add(subTotal, taxTotal, recargoTotal);
  let totalWithRecargo = total; // Assuming total with recargo is the same as total



  body['subTotal'] = subTotal;
  body['totalWithRecargo'] = totalWithRecargo; // Add totalWithRecargo to body
  body['taxTotal'] = taxTotal;
  body['recargoTotal'] = recargoTotal;
  body['total'] = total;
  body['items'] = items;
  body['pdf'] = 'fact-' + req.params.number + '.pdf';

  let paymentStatus =
    calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';
  body['paymentStatus'] = paymentStatus;

  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    body,
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Actualizada factura con id: ' + req.params.id,
  });
};

module.exports = update;
