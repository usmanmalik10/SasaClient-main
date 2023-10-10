const API = {
  app_key: process.env.APP_KEY,
  partner_id: process.env.PARTNER_ID,
  shop_id: process.env.SHOP_ID,
};

const sessionSecret = process.env.SESSION_SECRET;
const port = process.env.PORT;
const environment = process.env.NODE_ENV || 'development';

module.exports = { API, sessionSecret, port, environment };
