const { poolPromise } = require('../config/database');
const { ORDER_DETAILS } = require('../constants/endpoints');
const tables = require('../constants/tables');
const asyncHandler = require('../middlewares/async');
const Token = require('../models/token');
const api = require('../services/api');
const general = require('../services/general');

const showOrderCompleteTimeForm = (_req, res) =>
  res.render('orders/orderCompleteTimeForm.ejs', { url: '/orders/fixordercompletetime' });
const fixOrderCompleteTime = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();

  const { ids } = req.body;
  const idsWithQuotes = ids
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i.length > 0)
    .join(',');

  console.log(idsWithQuotes);

  request.input('OrderIDs', idsWithQuotes);
  const dbResult = await request.query(`
    SELECT OrderID, ParentSKURefNum, SKURefNum, OrderCompleteTime
    FROM ${tables.ORDERS}
    WHERE OrderID IN (
      SELECT Split.a.value('.', 'NVARCHAR(MAX)') DATA
      FROM
      (
        SELECT CAST('<X>'+REPLACE(@OrderIDs, ',', '</X><X>')+'</X>' AS xml) AS STRING
      ) AS A
      CROSS APPLY String.nodes('/X') AS Split(a)
    )
  `);

  if (dbResult.recordset.length === 0) {
    req.flash('error', "Didn't find any record with id(s) provided");
    return res.redirect('/orders/showordercompletetimeform');
  }

  const { length: orderLength } = dbResult.recordset;

  const response = [];

  for (let i = 0; i < orderLength; i++) {
    const { OrderCompleteTime: orderCompleteTime } = dbResult.recordset[i];
    orderCompleteTime.setUTCDate(orderCompleteTime.getUTCDate() - 1);
    const modifiedDate = `${orderCompleteTime.toISOString().substring(0, 10)} 23:59`;

    const updateRequest = pool.request();
    updateRequest.input('OrderCompleteTime', modifiedDate);
    updateRequest.input('OrderID', dbResult.recordset[i].OrderID);

    const insertionResult = await updateRequest.query(`
      UPDATE ${tables.ORDERS}
      SET OrderCompleteTime = @OrderCompleteTime
      WHERE OrderID = @OrderID
    `);
    console.log(insertionResult);
    response.push(dbResult.recordset[i].OrderID);
  }

  req.flash('info', 'Process completed successfully!');
  return res.redirect('/orders/showordercompletetimeform');
});

const returnRefundStatusForm = (_req, res) => res.render('orders/returnRefundStatusForm.ejs');
const returnRefundStatus = async (_req, res) => {
  const token = await Token.getToken();
  if (!Token.isValid(token)) {
    throw new Error('Token Error');
  }
  // res.json({
  //   req: _req.query,
  //   res: 'hi',
  // });

  try {
    const response = await api.callApi(
      ORDER_DETAILS,
      {
        access_token: token.AccessToken,
        shop_id: +process.env.SHOP_ID,
      },
      {
        order_sn_list: ['asdfasdfasfd'],
      },
      'get',
      {},
      process.env.ENV
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
};

const showOrderDetailsForm = (_req, res) =>
  res.render('orders/orderDetailsForm.ejs', { url: '/orders/showorderdetailsform' });
const getOrderDetails = asyncHandler(async (req, res) => {
  const token = await Token.getToken();
  if (!Token.isValid(token)) {
    throw new Error('Token Error');
  }

  const { ids } = req.query;
  const idsWithQuotes = ids
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  const response = await api.callApi(
    ORDER_DETAILS,
    {
      access_token: token.AccessToken,
      shop_id: +process.env.SHOP_ID,
    },
    {
      order_sn_list: idsWithQuotes,
      response_optional_fields: [
        'item_list',
        'buyer_cancel_reason',
        'cancel_by',
        'cancel_reason',
        'tracking_no',
        'checkout_shipping_carrier',
        'shipping_carrier',
        'pay_time',
        'total_amount',
        'buyer_username',
        'estimated_shipping_fee',
        'recipient_address',
        'message_to_seller',
        'note',
      ],
    },
    'get',
    {},
    process.env.ENV
  );
  res.render('orders/orderDetails.ejs', {
    orders: response.response,
    general,
    url: '/orders/showorderdetailsform',
  });
});

module.exports = {
  showOrderCompleteTimeForm,
  fixOrderCompleteTime,
  returnRefundStatusForm,
  returnRefundStatus,
  showOrderDetailsForm,
  getOrderDetails,
};
