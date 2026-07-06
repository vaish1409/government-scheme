// Centralized error handler — every controller can just throw / call next(err)
function errorHandler(err, req, res, next) {
  console.error(err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.errors?.map((e) => e.message),
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server',
  });
}

function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
