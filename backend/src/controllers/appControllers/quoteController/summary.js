const mongoose = require('mongoose');
const moment = require('moment');

const Model = mongoose.model('Quote');

const summary = async (req, res) => {
  let defaultType = 'month';

  const { type, month } = req.query;

  try {
    if (type) {
      if (['week', 'month', 'year'].includes(type)) {
        defaultType = type;
      } else {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Invalid type',
        });
      }
    }

    const currentDate = moment();
    let startDate = currentDate.clone().startOf(defaultType);
    let endDate = currentDate.clone().endOf(defaultType);

    // Apply month filter if provided
    if (month && moment(month, 'YYYY-MM', true).isValid()) {
      startDate = moment(month, 'YYYY-MM').startOf('month');
      endDate = moment(month, 'YYYY-MM').endOf('month');
    } else {
      // If month is invalid, set a default to the current month
      startDate = currentDate.clone().startOf('month');
      endDate = currentDate.clone().endOf('month');
    }

    const statuses = ['draft', 'pending', 'sent', 'expired', 'declined', 'accepted'];

    // *** Fetch Total and Count First ***
    const totalQuotesAggregation = await Model.aggregate([
      {
        $match: {
          removed: false,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    let total = 0;
    let totalCount = 0;
    if (totalQuotesAggregation.length > 0) {
      total = totalQuotesAggregation[0].total || 0; // Default to 0 if total is undefined
      totalCount = totalQuotesAggregation[0].count || 0;
    }

    // *** Then Aggregate by Status ***
    const result = await Model.aggregate([
      {
        $match: {
          removed: false,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_amount: { $sum: '$total' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          total_amount: 1,
        },
      },
    ]);

    // Create a map of results for easy access
    const resultMap = result.reduce((map, item) => {
      map[item.status] = item;
      return map;
    }, {});

    // Fill in missing statuses and calculate percentages
    const formattedResult = statuses.map((status) => {
      const item = resultMap[status] || { status, count: 0, total_amount: 0 };
      item.percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
      return item;
    });

    // Format the total
    const formattedTotal = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total).replace('€', '') + '€';

    // Final response
    const finalResult = {
      total: total, // Return the raw total value without formatting
      type: defaultType,
      performance: formattedResult,
    };

    res.status(200).json({
      success: true,
      result: finalResult,
      message: `Successfully found all Quotations for the last ${defaultType}${month ? ` of ${month}` : ''}`,
    });
  } catch (error) {
    console.error('Error in summary function:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = summary;