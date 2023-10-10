const httpStatusCodes = require('../constants/statusCodes');
const ApiRequestError = require('../exceptions/apiRequestError');

module.exports = (request) => async (req, _res, next) => {
  try {
    let requestData = {};
    if (req.method === 'GET') requestData = req.query;
    else requestData = req.body;
    const value = await request.validateAsync(requestData);
    req.validated = value;
  } catch (error) {
    const validationError = new ApiRequestError(
      'Validation error',
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    return next(validationError);
  }
  return next();
};
