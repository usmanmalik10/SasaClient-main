const errorHandler = (err, _req, res, _next) => {
  const error = { ...err };
  error.message = err.message;

  // log to console for developer
  // console.log(err.stack);
  // console.log(err.name);
  console.error(err);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
