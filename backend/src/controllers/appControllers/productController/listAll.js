const { migrate } = require('./migrate');

const listAll = async (Model, req, res) => {
  const sort = parseInt(req.query.sort) || 'desc';

  try {
    const result = await Model.find({ removed: false })
      .sort({ created: sort })
      .populate()
      .exec();

    const migratedData = result.map(x => migrate(x));

    return res.status(200).json({
      success: true,
      result: migratedData,
      message: 'Successfully found all documents'
    });
  } catch (error) {
    console.error("Error in listAll:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

module.exports = listAll;