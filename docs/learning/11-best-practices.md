# 11 - Best Practices & Production Patterns

> **Chapter 11: Production-Ready Code - Security, Performance, Scalability & Maintainability**

## 📋 Chapter Overview

Best Practices adalah **proven patterns** yang telah teruji di production environment. Chapter ini mencakup:
- **Security best practices** (authentication, authorization, input validation)
- **Performance optimization** (caching, database optimization, monitoring)
- **Scalability patterns** (horizontal scaling, load balancing)
- **Code quality** (maintainability, documentation, error handling)

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Implementasi comprehensive security measures
- ✅ Optimize aplikasi untuk performance dan scalability
- ✅ Apply production-ready error handling
- ✅ Implement proper logging dan monitoring
- ✅ Create maintainable dan documented code
- ✅ Handle deployment dan operational concerns

## 🔐 Security Best Practices

### **1. Input Validation & Sanitization**
```javascript
// ✅ GOOD: Comprehensive input validation
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

class SecurityValidator {
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove potential XSS
      input = DOMPurify.sanitize(input);
      
      // Trim whitespace
      input = input.trim();
      
      // Remove null bytes
      input = input.replace(/\0/g, '');
    }
    
    return input;
  }

  static validateRecipeInput(data) {
    const errors = [];
    
    // Sanitize inputs
    data.title = this.sanitizeInput(data.title);
    data.description = this.sanitizeInput(data.description);
    
    // Validate title
    if (!data.title || data.title.length < 3 || data.title.length > 200) {
      errors.push('Title must be between 3 and 200 characters');
    }
    
    // Validate email if present
    if (data.authorEmail && !validator.isEmail(data.authorEmail)) {
      errors.push('Invalid email format');
    }
    
    // Validate arrays
    if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      errors.push('Ingredients must be a non-empty array');
    }
    
    // Sanitize array elements
    if (Array.isArray(data.ingredients)) {
      data.ingredients = data.ingredients
        .map(item => this.sanitizeInput(item))
        .filter(item => item && item.length > 0);
    }
    
    return { sanitizedData: data, errors };
  }
}

// Usage in middleware
const secureValidation = (req, res, next) => {
  try {
    const { sanitizedData, errors } = SecurityValidator.validateRecipeInput(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    req.body = sanitizedData;
    next();
  } catch (error) {
    next(error);
  }
};
```

### **2. Authentication & Authorization**
```javascript
// ✅ GOOD: Robust JWT authentication
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'recipe-api',
        audience: 'recipe-app'
      }
    );
  }

  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

// Authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// Usage
app.post('/api/auth/login', authLimiter, loginController);
app.get('/api/recipes/admin', authenticateToken, authorize('admin'), adminController);
```

### **3. Security Headers & HTTPS**
```javascript
// ✅ GOOD: Comprehensive security middleware
const helmet = require('helmet');

const securityMiddleware = (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'"
  );
  
  // Remove potentially sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// HTTPS redirect in production
const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
};

app.use(httpsRedirect);
app.use(securityMiddleware);
```

## 🚀 Performance Optimization

### **1. Database Query Optimization**
```javascript
// ✅ GOOD: Optimized database operations
class OptimizedRecipeRepository {
  constructor(db) {
    this.db = db;
  }

  // Use prepared statements
  async findById(id) {
    const query = 'SELECT * FROM recipes WHERE id = ? LIMIT 1';
    const [rows] = await this.db.execute(query, [id]);
    
    if (rows.length === 0) {
      throw new Error('Recipe not found');
    }
    
    return this.parseRecipe(rows[0]);
  }

  // Batch operations
  async findByIds(ids) {
    if (ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT * FROM recipes WHERE id IN (${placeholders})`;
    const [rows] = await this.db.execute(query, ids);
    
    return rows.map(row => this.parseRecipe(row));
  }

  // Pagination with offset optimization
  async findAllPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Get total count efficiently
    const [countResult] = await this.db.execute('SELECT COUNT(*) as total FROM recipes');
    const total = countResult[0].total;
    
    // Get paginated results
    const query = 'SELECT * FROM recipes ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await this.db.execute(query, [limit, offset]);
    
    return {
      data: rows.map(row => this.parseRecipe(row)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Search with indexed fields
  async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Use FULLTEXT search if available, otherwise LIKE
    const query = `
      SELECT *, 
             MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM recipes 
      WHERE MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await this.db.execute(query, [searchTerm, searchTerm, limit, offset]);
    
    return rows.map(row => this.parseRecipe(row));
  }

  parseRecipe(row) {
    return new RecipeModel({
      ...row,
      ingredients: typeof row.ingredients === 'string' 
        ? JSON.parse(row.ingredients) 
        : row.ingredients,
      instructions: typeof row.instructions === 'string'
        ? JSON.parse(row.instructions)
        : row.instructions
    });
  }
}
```

### **2. Caching Strategies**
```javascript
// ✅ GOOD: Multi-level caching
const Redis = require('redis');
const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    // In-memory cache for frequently accessed data
    this.memoryCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
    
    // Redis for distributed caching
    this.redisClient = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
  }

  generateKey(prefix, id) {
    return `${prefix}:${id}`;
  }

  async get(key) {
    // Try memory cache first
    let data = this.memoryCache.get(key);
    if (data) {
      return data;
    }

    // Try Redis cache
    try {
      const cached = await this.redisClient.get(key);
      if (cached) {
        data = JSON.parse(cached);
        // Store in memory cache for faster access
        this.memoryCache.set(key, data);
        return data;
      }
    } catch (error) {
      console.error('Redis error:', error);
    }

    return null;
  }

  async set(key, data, ttl = 3600) {
    // Store in memory cache
    this.memoryCache.set(key, data, ttl);

    // Store in Redis
    try {
      await this.redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis error:', error);
    }
  }

  async del(key) {
    this.memoryCache.del(key);
    
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Redis error:', error);
    }
  }

  async invalidatePattern(pattern) {
    // Invalidate memory cache
    const keys = this.memoryCache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.memoryCache.del(key);
      }
    });

    // Invalidate Redis cache
    try {
      const redisKeys = await this.redisClient.keys(`*${pattern}*`);
      if (redisKeys.length > 0) {
        await this.redisClient.del(redisKeys);
      }
    } catch (error) {
      console.error('Redis error:', error);
    }
  }
}

// Cached service layer
class CachedRecipeService {
  constructor(repository, cache) {
    this.repository = repository;
    this.cache = cache;
  }

  async getRecipeById(id) {
    const cacheKey = this.cache.generateKey('recipe', id);
    
    // Try cache first
    let recipe = await this.cache.get(cacheKey);
    if (recipe) {
      return recipe;
    }

    // Get from database
    recipe = await this.repository.findById(id);
    const jsonData = recipe.toJSON();

    // Cache the result
    await this.cache.set(cacheKey, jsonData, 3600); // 1 hour

    return jsonData;
  }

  async updateRecipe(id, updateData) {
    const recipe = await this.repository.update(id, updateData);
    
    // Invalidate cache
    const cacheKey = this.cache.generateKey('recipe', id);
    await this.cache.del(cacheKey);
    
    // Also invalidate list caches
    await this.cache.invalidatePattern('recipes:list');
    
    return recipe.toJSON();
  }

  async getAllRecipes(page = 1, limit = 10) {
    const cacheKey = this.cache.generateKey('recipes:list', `${page}:${limit}`);
    
    let recipes = await this.cache.get(cacheKey);
    if (recipes) {
      return recipes;
    }

    recipes = await this.repository.findAllPaginated(page, limit);
    
    // Cache for shorter time due to frequent updates
    await this.cache.set(cacheKey, recipes, 600); // 10 minutes

    return recipes;
  }
}
```

### **3. Response Compression & Optimization**
```javascript
// ✅ GOOD: Response optimization
const compression = require('compression');

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024 // Only compress responses > 1KB
});

// Response optimization middleware
const responseOptimization = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Add response timing
    if (!res.locals.startTime) {
      res.locals.startTime = Date.now();
    }
    
    const responseTime = Date.now() - res.locals.startTime;
    
    // Add metadata
    const optimizedResponse = {
      success: true,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        version: process.env.API_VERSION || '1.0.0'
      }
    };
    
    // Set cache headers for static content
    if (req.method === 'GET' && res.statusCode === 200) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      res.setHeader('ETag', generateETag(data));
    }
    
    originalJson.call(this, optimizedResponse);
  };
  
  // Track request start time
  res.locals.startTime = Date.now();
  next();
};

function generateETag(data) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

app.use(compressionMiddleware);
app.use(responseOptimization);
```

## 📊 Monitoring & Logging

### **1. Structured Logging**
```javascript
// ✅ GOOD: Structured logging with Winston
const winston = require('winston');

class Logger {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'recipe-api',
        version: process.env.API_VERSION || '1.0.0'
      },
      transports: [
        // Console for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File for production
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = null, meta = {}) {
    this.logger.error(message, {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Request logging
  logRequest(req, res, responseTime) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }

  // Database operation logging
  logDbOperation(operation, table, duration, error = null) {
    if (error) {
      this.error('Database operation failed', error, {
        operation,
        table,
        duration
      });
    } else {
      this.debug('Database operation', {
        operation,
        table,
        duration: `${duration}ms`
      });
    }
  }
}

const logger = new Logger();

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};
```

### **2. Health Checks & Metrics**
```javascript
// ✅ GOOD: Comprehensive health checks
class HealthChecker {
  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }

  async checkDatabase() {
    try {
      const start = Date.now();
      await this.db.execute('SELECT 1');
      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: duration,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.name
      };
    }
  }

  async checkCache() {
    try {
      const start = Date.now();
      await this.cache.redisClient.ping();
      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: duration,
        message: 'Cache connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.name
      };
    }
  }

  checkMemory() {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.rss / 1024 / 1024);
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    
    const memoryHealthy = totalMB < 512; // Alert if using more than 512MB
    
    return {
      status: memoryHealthy ? 'healthy' : 'warning',
      usage: {
        rss: `${totalMB}MB`,
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`
      },
      message: memoryHealthy ? 'Memory usage normal' : 'High memory usage detected'
    };
  }

  async performHealthCheck() {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      memory: this.checkMemory(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    const overallHealthy = Object.values(checks)
      .filter(check => typeof check === 'object' && check.status)
      .every(check => check.status !== 'unhealthy');

    return {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      checks: checks
    };
  }
}

// Health check endpoints
const healthChecker = new HealthChecker(db, cache);

app.get('/health', async (req, res) => {
  try {
    const health = await healthChecker.performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Simple liveness probe
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe
app.get('/health/ready', async (req, res) => {
  try {
    await healthChecker.checkDatabase();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

## 🔧 Code Quality & Maintainability

### **1. API Documentation**
```javascript
// ✅ GOOD: Comprehensive API documentation with Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe API',
      version: '1.0.0',
      description: 'A comprehensive recipe management API',
      contact: {
        name: 'API Support',
        email: 'support@recipeapi.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Recipe: {
          type: 'object',
          required: ['title', 'ingredients', 'instructions'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier'
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Recipe title'
            },
            description: {
              type: 'string',
              description: 'Recipe description'
            },
            ingredients: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'List of ingredients'
            },
            instructions: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'Cooking instructions'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API docs
};

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of recipes per page
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### **2. Error Handling Best Practices**
```javascript
// ✅ GOOD: Comprehensive error handling
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(`Database error: ${message}`, 500, false);
  }
}

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (process.env.NODE_ENV !== 'test') {
    logger.error('Global error handler', err, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Programming or unknown error: don't leak error details
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Usage in controllers
const getRecipeById = catchAsync(async (req, res, next) => {
  const recipe = await recipeService.getRecipeById(req.params.id);
  
  if (!recipe) {
    return next(new NotFoundError('Recipe'));
  }
  
  res.json({
    success: true,
    data: recipe
  });
});
```

## 📝 Hands-on Exercises

### **Exercise 1: Implement API Rate Limiting**
```javascript
// exercises/rateLimiting.js
// TODO: Implement sophisticated rate limiting
// - Different limits for different endpoints
// - User-specific rate limiting
// - Sliding window algorithm
// - Rate limit headers in response
```

### **Exercise 2: Add Comprehensive Monitoring**
```javascript
// exercises/monitoring.js
// TODO: Implement application monitoring
// - Performance metrics collection
// - Error rate tracking
// - Response time percentiles
// - Custom business metrics
```

### **Exercise 3: Security Hardening**
```javascript
// exercises/security.js
// TODO: Implement advanced security features
// - Input validation for all endpoints
// - SQL injection prevention
// - CSRF protection
// - Content type validation
```

## 🎯 Best Practices Summary

### **✅ DO**
- **Validate Everything**: Input, output, environment variables
- **Log Structured Data**: Use JSON logging with correlation IDs
- **Cache Intelligently**: Multiple cache layers with appropriate TTLs
- **Monitor Proactively**: Health checks, metrics, alerts
- **Document APIs**: Use OpenAPI/Swagger for comprehensive docs
- **Handle Errors Gracefully**: Specific error types with helpful messages
- **Secure by Default**: Authentication, authorization, input sanitization

### **❌ DON'T**
- **Log Sensitive Data**: Passwords, tokens, personal information
- **Ignore Performance**: Always profile and optimize bottlenecks
- **Skip Health Checks**: Essential for production deployments
- **Hardcode Secrets**: Use environment variables and secret management
- **Return Stack Traces**: In production, sanitize error responses
- **Trust User Input**: Validate and sanitize everything
- **Forget Documentation**: APIs change, documentation should too

## 🚀 Next Steps

Setelah menguasai Best Practices:

1. **[🚨 Common Pitfalls →](12-common-pitfalls.md)** - Avoid common mistakes
2. **[🔧 Troubleshooting →](13-troubleshooting.md)** - Debug production issues
3. **Apply to Real Projects** - Implement these patterns in production

---

## 💡 Key Takeaways

- **Security is Not Optional** - Implement defense in depth
- **Performance Matters** - Optimize early and measure continuously
- **Monitoring is Essential** - You can't fix what you can't see
- **Documentation Lives** - Keep it updated and comprehensive
- **Errors Happen** - Handle them gracefully and informatively
- **Quality is a Process** - Build it into your development workflow

**Next Chapter: [12 - Common Pitfalls →](12-common-pitfalls.md)**
