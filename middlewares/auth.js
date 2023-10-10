const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/auth/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/orders/showordercompletetimeform');
  }
  return next();
};

module.exports = { isAuthenticated, isNotAuthenticated };
