const httpStatusCodes = require('../constants/statusCodes');
const BaseError = require('./baseError');

class ApiRequestError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY,
    description = 'The input cannot be processed',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = ApiRequestError;
