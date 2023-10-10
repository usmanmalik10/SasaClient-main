const generateEndpoint = (endpoint, prefix = '/api/v2') => prefix + endpoint;

module.exports = {
  ORDER_DETAILS: generateEndpoint('/order/get_order_detail'),
};
