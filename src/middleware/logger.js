// Request logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  // Log request body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }

  // Capture response time
  const startTime = Date.now();

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${responseTime}ms`);
    
    // Log response for learning purposes (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
    return originalJson.call(this, data);
  };

  next();
};

module.exports = logger;
