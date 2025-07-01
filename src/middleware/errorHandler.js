// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Suppress console.error in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error occurred:', err);
  }

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle different types of errors
  if (err.type === 'entity.parse.failed') {
    // JSON parsing errors
    statusCode = 400;
    message = 'Invalid JSON format';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('required') || err.message.includes('Validation')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Invalid')) {
    statusCode = 400;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.message : (err.message || 'Something went wrong'),
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = errorHandler;
