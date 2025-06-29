const express = require('express');
const app = express();

// Import middleware
const logger = require('./middleware/logger');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const recipeRoutes = require('./routes/recipeRoutes');

// Apply middleware in correct order
app.use(cors);           // 1. CORS first
app.use(logger);         // 2. Log all requests
app.use(express.json()); // 3. Parse JSON body

// Apply routes
app.use('/api/recipes', recipeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Recipe API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler untuk routes yang tidak ditemukan
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last!)
app.use(errorHandler);

module.exports = app;