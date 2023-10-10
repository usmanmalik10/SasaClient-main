const crypto = require('crypto');
const axios = require('axios');
const generalService = require('./general');
const tables = require('../constants/tables');

const generateBaseString = (endpoint, commonParams) => {
  const { partner_id: partnerId, timestamp, ...params } = commonParams;
  let string = partnerId + endpoint + timestamp;
  for (const [_key, value] of Object.entries(params)) string += value;

  return string;
};

const generateSign = (endpoint, commonParams) => {
  const baseString = generateBaseString(endpoint, commonParams);
  const sign = crypto.createHmac('sha256', process.env.APP_KEY).update(baseString).digest('hex');
  return sign;
};

const callApi = async (
  endpoint,
  commonParams = {},
  params = {},
  method = 'get',
  body = {},
  type = 'test'
) => {
  const logObject = {};
  let url = `https://partner.${type === 'production' ? '' : 'test-stable.'}shopeemobile.com`;
  const timestamp = generalService.getTimestamp();

  // Will attach to all requests
  const editedCommanParams = { ...commonParams, partner_id: +process.env.PARTNER_ID, timestamp };
  // sign also needs to be included in params
  const sign = generateSign(endpoint, editedCommanParams);
  const editedParams = { ...params, sign };

  // query string will be attached to url regardless of request method
  const allParams = Object.assign(editedCommanParams, editedParams);
  const queryString = new URLSearchParams(allParams).toString();
  url += `${endpoint}?${queryString}`;

  const axiosData = { method, url };
  if (method === 'post') {
    axiosData.data = body;
  }

  logObject.RequestURL = url;
  logObject.RequestData = JSON.stringify(body);
  for (let failureCount = 0; failureCount < 3; failureCount++) {
    try {
      const response = await axios(axiosData);
      logObject.StatusCode = response.status;
      logObject.ResponseData = JSON.stringify(response.data);

      await generalService.insertQueryWithoutID(tables.REQRES, logObject);
      if (response.data.error.length === 0) return response.data;
    } catch (error) {
      // Errors maybe API errors which will be handled by error handler
      // Sometimes errors are request specific those will be sent back to caller
      if (typeof error.response !== 'undefined') {
        logObject.StatusCode = error.response.status;
        logObject.ResponseData = JSON.stringify(error.response.data);
      } else {
        logObject.StatusCode = 500;
        logObject.ResponseData = JSON.stringify(error);
      }

      await generalService.insertQueryWithoutID(tables.REQRES, logObject);
    }
  }
  throw new Error('Api Error');
};

module.exports = {
  callApi,
};
