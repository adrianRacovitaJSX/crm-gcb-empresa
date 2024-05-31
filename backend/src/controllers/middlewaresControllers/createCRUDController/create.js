const create = async (Model, req, res) => {
  // Creating a new document in the collection
  req.body.removed = false;
  const result = await new Model(req.body).save();

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result,
    message: 'Se ha creado con éxito.',
  });
};

module.exports = create;
