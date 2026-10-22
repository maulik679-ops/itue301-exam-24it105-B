/**
 * Task 3 & Task 5: Global error-handling middleware
 * Returns structured JSON instead of raw stack traces.
 * Gracefully handles Mongoose ValidationError, CastError, and duplicate key errors.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Handled Error:', err.message || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Mongoose Duplicate Key Error (e.g. unique email or licenseNumber)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field} '${err.keyValue[field]}' already exists`;
  }

  // Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
