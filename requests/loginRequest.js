const Joi = require('joi');

// create a schema
const schema = Joi.object({
  usercode: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = schema;
