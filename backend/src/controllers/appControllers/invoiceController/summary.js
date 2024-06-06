const mongoose = require('mongoose');
const moment = require('moment');

const Model = mongoose.model('Invoice');

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
      // If month is invalid or not provided, set a default to the current month
      startDate = currentDate.clone().startOf('month');
      endDate = currentDate.clone().endOf('month');
    }

    const statuses = ['draft', 'pending', 'overdue', 'paid', 'unpaid', 'partially'];

    const response = await Model.aggregate([
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
        $facet: {
          totalInvoice: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: '$total',
                },
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $project: {
                _id: 0,
                total: '$total',
                count: '$count',
              },
            },
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: '$count',
              },
            },
          ],
          paymentStatusCounts: [
            {
              $group: {
                _id: '$paymentStatus',
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: '$count',
              },
            },
          ],
          overdueCounts: [
            {
              $match: {
                expiredDate: {
                  $lt: new Date(),
                },
              },
            },
            {
              $group: {
                _id: '$status',
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: '$count',
              },
            },
          ],
        },
      },
    ]);

    let result = [];
    const totalInvoices = response[0]?.totalInvoice?.[0] || { total: 0, count: 0 };

    if (totalInvoices.count === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontraron facturas para la fecha: ${month}.`,
      });
    }

    const statusResult = response[0].statusCounts || [];
    const paymentStatusResult = response[0].paymentStatusCounts || [];
    const overdueResult = response[0].overdueCounts || [];

    const statusResultMap = statusResult.map((item) => {
      return {
        ...item,
        percentage:
          totalInvoices.count > 0 ? Math.round((item.count / totalInvoices.count) * 100) : 0,
      };
    });

    const paymentStatusResultMap = paymentStatusResult.map((item) => {
      return {
        ...item,
        percentage:
          totalInvoices.count > 0 ? Math.round((item.count / totalInvoices.count) * 100) : 0,
      };
    });

    const overdueResultMap = overdueResult.map((item) => {
      return {
        ...item,
        status: 'overdue',
        percentage:
          totalInvoices.count > 0 ? Math.round((item.count / totalInvoices.count) * 100) : 0,
      };
    });

    statuses.forEach((status) => {
      const found = [...paymentStatusResultMap, ...statusResultMap, ...overdueResultMap].find(
        (item) => item.status === status
      );
      if (found) {
        result.push(found);
      }
    });

    const unpaid = await Model.aggregate([
      {
        $match: {
          removed: false,
          ...(month && {
            date: {
              $gte: moment(month, 'YYYY-MM').startOf('month').toDate(),
              $lte: moment(month, 'YYYY-MM').endOf('month').toDate(),
            },
          }),
          paymentStatus: {
            $in: ['unpaid', 'partially'],
          },
        },
      },
      {
        $group: {
          _id: null,
          total_amount: {
            $sum: {
              $subtract: ['$total', '$credit'],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total_amount: '$total_amount',
        },
      },
    ]);

    const finalResult = {
      total: totalInvoices.total,
      total_undue: unpaid.length > 0 ? unpaid[0].total_amount : 0,
      type,
      performance: result,
    };
    return res.status(200).json({
      success: true,
      result: finalResult,
      message: `Successfully found all invoices for the last ${defaultType}${
        month ? ` of ${month}` : ''
      }`,
    });
  } catch (error) {
    console.error('Error in summary function:', error.message, error.stack);

    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(422)
        .json({ success: false, message: 'Validation error', errors: error.errors });
    } else if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    } else {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
};

module.exports = summary;
