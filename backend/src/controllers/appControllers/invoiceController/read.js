const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const read = async (req, res) => {
  // Find document by id
  const result = await Model.findOne({ _id: req.params.id, removed: false })
    .populate('createdBy', 'name')
    .exec();
  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No se ha encontrado la factura con id: ' + req.params.id,
    });
  } else {
    // Return success resposne
    return res.status(200).json({
      success: true,
      result,
      message: 'Encontrada la factura con id: ' + req.params.id,
    });
  }
};

module.exports = read;
