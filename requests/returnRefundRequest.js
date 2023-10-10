const Joi = require('joi');

// create a schema
const schema = Joi.object({
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
});

module.exports = schema;
