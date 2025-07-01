# 07 - Middleware Layer & Cross-cutting Concerns

> **Chapter 7: Mastering Middleware - Authentication, Logging, Validation & Error Handling**

## 📋 Chapter Overview

Middleware Layer adalah **cross-cutting concerns** yang berjalan di antara HTTP request dan response. Middleware memungkinkan kita untuk:
- **Pre-process requests** (authentication, validation)
- **Post-process responses** (logging, formatting)
- **Handle cross-cutting concerns** (CORS, security headers)
- **Error handling** yang centralized

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Memahami middleware pattern dalam Express.js
- ✅ Implementasi authentication & authorization middleware
- ✅ Membuat custom validation middleware
- ✅ Setup comprehensive error handling
- ✅ Apply security best practices
- ✅ Create reusable middleware components

## 🏗️ Middleware Architecture

### **Middleware Stack Position**
```
┌─────────────────┐
│   HTTP Request  │
├─────────────────┤
│ 🔐 Auth         │ ← Authentication/Authorization
│ 🛡️  CORS        │ ← Cross-Origin Resource Sharing
│ 📝 Logger       │ ← Request/Response logging
│ ✅ Validation   │ ← Input validation
│ 📊 Rate Limit   │ ← Traffic control
├─────────────────┤
│   Controller    │ ← Route handlers
├─────────────────┤
│ 🚨 Error Handle │ ← Error processing
│ 📄 Response     │ ← Response formatting
└─────────────────┘
```

### **Middleware Types**
1. **Application-level**: Runs for all routes
2. **Router-level**: Runs for specific route groups
3. **Error-handling**: Catches and processes errors
4. **Built-in**: Express built-in middleware
5. **Third-party**: External middleware packages

## 🔍 Real Implementation Analysis

Mari kita analyze middleware yang ada di project ini:

### **1. CORS Middleware**
```javascript
// src/middleware/cors.js - Real Implementation
const corsMiddleware = (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

module.exports = corsMiddleware;
```

### **2. Logger Middleware**
```javascript
// src/middleware/logger.js - Real Implementation
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log request
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  
  // Capture response details
  const originalSend = res.send;
  res.send = function(data) {
    const statusCode = res.statusCode;
    const contentLength = Buffer.byteLength(data, 'utf8');
    
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${contentLength} bytes`);
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = logger;
```

### **3. Validation Middleware**
```javascript
// src/middleware/validation.js - Real Implementation
const RecipeModel = require('../models/recipeModel');

const validateRecipe = (req, res, next) => {
  try {
    const recipe = new RecipeModel(req.body);
    const errors = recipe.validate();
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Attach validated data to request
    req.validatedData = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

const validateRecipeUpdate = (req, res, next) => {
  try {
    // For updates, we allow partial data
    const recipe = new RecipeModel(req.body);
    
    // Only validate fields that are present
    const errors = [];
    if (req.body.title !== undefined && (!req.body.title || req.body.title.length < 3)) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (req.body.ingredients !== undefined && (!Array.isArray(req.body.ingredients) || req.body.ingredients.length === 0)) {
      errors.push('Ingredients must be a non-empty array');
    }
    
    if (req.body.instructions !== undefined && (!Array.isArray(req.body.instructions) || req.body.instructions.length === 0)) {
      errors.push('Instructions must be a non-empty array');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    req.validatedData = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRecipe,
  validateRecipeUpdate
};
```

### **4. Error Handler Middleware**
```javascript
// src/middleware/errorHandler.js - Real Implementation
const errorHandler = (err, req, res, next) => {
  // Prevent logging errors during testing
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
  }
  
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Handle specific error types
  if (err.message && err.message.includes('Validation failed')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message && err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // JSON parsing error
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

## 📊 Middleware Patterns & Best Practices

### **1. Authentication Middleware Pattern**
```javascript
// ✅ GOOD: Reusable authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token (using JWT example)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Usage in routes
router.get('/protected', authenticateUser, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});
```

### **2. Role-based Authorization Pattern**
```javascript
// ✅ GOOD: Flexible authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Usage
router.delete('/recipes/:id', 
  authenticateUser, 
  authorize('admin', 'moderator'), 
  deleteRecipe
);
```

### **3. Validation Middleware Factory**
```javascript
// ✅ GOOD: Generic validation factory
const createValidator = (ModelClass, options = {}) => {
  return (req, res, next) => {
    try {
      const instance = new ModelClass(req.body);
      const errors = instance.validate();
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: options.message || 'Validation failed',
          errors: errors
        });
      }
      
      req.validatedData = instance;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Usage untuk berbagai models
const validateRecipe = createValidator(RecipeModel, { 
  message: 'Recipe validation failed' 
});

const validateUser = createValidator(UserModel, { 
  message: 'User data validation failed' 
});
```

### **4. Rate Limiting Pattern**
```javascript
// ✅ GOOD: Smart rate limiting
const createRateLimiter = (options) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Clean old entries
    for (const [key, timestamps] of requests.entries()) {
      requests.set(key, timestamps.filter(time => time > windowStart));
      if (requests.get(key).length === 0) {
        requests.delete(key);
      }
    }
    
    // Check current client
    const clientRequests = requests.get(clientId) || [];
    
    if (clientRequests.length >= options.max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
    
    clientRequests.push(now);
    requests.set(clientId, clientRequests);
    
    next();
  };
};

// Usage
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🔧 Advanced Middleware Implementations

### **1. Request/Response Transformation Middleware**
```javascript
const transformRequest = (req, res, next) => {
  // Transform incoming data
  if (req.body && typeof req.body === 'object') {
    // Convert string numbers to actual numbers
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string' && !isNaN(req.body[key])) {
        req.body[key] = Number(req.body[key]);
      }
    });
    
    // Trim string values
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

const transformResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Add metadata to all responses
    const transformedData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: data,
      meta: {
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0'
      }
    };
    
    originalJson.call(this, transformedData);
  };
  
  next();
};
```

### **2. Security Headers Middleware**
```javascript
const securityHeaders = (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove potentially sensitive headers
  res.removeHeader('X-Powered-By');
  
  next();
};
```

### **3. Request Tracing Middleware**
```javascript
const requestTracing = (req, res, next) => {
  // Generate unique request ID
  req.requestId = req.headers['x-request-id'] || 
    Math.random().toString(36).substring(2, 15);
  
  // Add to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  // Start timer
  req.startTime = Date.now();
  
  // Override res.end to capture timing
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - req.startTime;
    
    console.log(`[${req.requestId}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    originalEnd.apply(this, args);
  };
  
  next();
};
```

## 🧪 Testing Middleware

### **Unit Testing Middleware**
```javascript
// tests/unit/middleware.test.js
describe('Validation Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should pass validation with valid data', () => {
    req.body = {
      title: 'Valid Recipe',
      ingredients: ['ingredient1'],
      instructions: ['step1']
    };
    
    validateRecipe(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.validatedData).toBeInstanceOf(RecipeModel);
  });

  test('should return 400 for invalid data', () => {
    req.body = {
      title: '', // Invalid
      ingredients: [],
      instructions: []
    };
    
    validateRecipe(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed'
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
```

### **Integration Testing with Middleware**
```javascript
// tests/integration/middleware.test.js
describe('Middleware Integration', () => {
  test('should apply all middleware in correct order', async () => {
    const response = await request(app)
      .post('/api/recipes')
      .send({
        title: 'Test Recipe',
        ingredients: ['test'],
        instructions: ['test']
      });
    
    // Check CORS headers
    expect(response.headers['access-control-allow-origin']).toBe('*');
    
    // Check response format (from transform middleware)
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('timestamp');
    
    // Check security headers
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
```

## 🚨 Common Middleware Pitfalls

### **❌ Pitfall 1: Not Calling next()**
```javascript
// BAD: Forgotten next() call
const badMiddleware = (req, res, next) => {
  if (someCondition) {
    res.status(400).json({ error: 'Bad request' });
    // Missing return or next() - request hangs!
  }
  next();
};
```

**✅ Solution: Always handle flow control**
```javascript
// GOOD: Proper flow control
const goodMiddleware = (req, res, next) => {
  if (someCondition) {
    return res.status(400).json({ error: 'Bad request' });
  }
  next();
};
```

### **❌ Pitfall 2: Middleware Order Issues**
```javascript
// BAD: Error handler before routes
app.use(errorHandler);
app.use('/api/recipes', recipeRoutes);
```

**✅ Solution: Correct middleware order**
```javascript
// GOOD: Error handler after routes
app.use('/api/recipes', recipeRoutes);
app.use(errorHandler);
```

### **❌ Pitfall 3: Synchronous Errors in Async Middleware**
```javascript
// BAD: Unhandled async errors
const badAsyncMiddleware = async (req, res, next) => {
  const data = await someAsyncOperation(); // Might throw
  req.data = data;
  next();
};
```

**✅ Solution: Proper error handling**
```javascript
// GOOD: Wrapped async middleware
const goodAsyncMiddleware = async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    req.data = data;
    next();
  } catch (error) {
    next(error);
  }
};

// Or using a wrapper function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const wrappedMiddleware = asyncHandler(async (req, res, next) => {
  const data = await someAsyncOperation();
  req.data = data;
  next();
});
```

## 📝 Hands-on Exercises

### **Exercise 1: Create Authentication Middleware**
Implementasi JWT-based authentication:

```javascript
// exercises/auth-middleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // TODO: Extract token from header
  // TODO: Verify token
  // TODO: Attach user to request
  // TODO: Handle errors appropriately
};

const generateToken = (user) => {
  // TODO: Create JWT token
};

module.exports = { authenticateToken, generateToken };
```

### **Exercise 2: Create Caching Middleware**
Implementasi simple in-memory caching:

```javascript
// exercises/cache-middleware.js
const cache = new Map();

const cacheMiddleware = (ttl = 60000) => {
  return (req, res, next) => {
    // TODO: Check if response is cached
    // TODO: Return cached response if exists
    // TODO: Cache response after processing
  };
};
```

### **Exercise 3: Create Input Sanitization Middleware**
Implementasi XSS protection:

```javascript
// exercises/sanitize-middleware.js
const sanitizeInput = (req, res, next) => {
  // TODO: Sanitize req.body
  // TODO: Remove dangerous HTML/JavaScript
  // TODO: Validate input formats
};
```

## 🔗 Middleware Integration in App

### **Complete Application Setup**
```javascript
// src/app.js - Real Implementation Pattern
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { validateRecipe } = require('./middleware/validation');

const app = express();

// 1. Built-in middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Third-party middleware
app.use(corsMiddleware);

// 3. Custom application-level middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(logger);
}

// 4. Routes with route-specific middleware
app.use('/api/recipes', recipeRoutes);

// 5. Error handling middleware (MUST be last)
app.use(errorHandler);

module.exports = app;
```

## 🎯 Best Practices Summary

### **✅ DO**
- **Order Matters**: Apply middleware in correct sequence
- **Error Handling**: Always handle async errors properly
- **Single Responsibility**: Each middleware should do one thing
- **Reusability**: Create generic, configurable middleware
- **Testing**: Test middleware in isolation and integration

### **❌ DON'T**
- **Forget next()**: Always call next() or send response
- **Mix Concerns**: Keep middleware focused on specific concerns
- **Ignore Errors**: Always handle async errors
- **Hardcode Values**: Make middleware configurable
- **Skip Testing**: Middleware is critical infrastructure

## 🚀 Next Steps

Setelah menguasai Middleware Layer:

1. **[🧪 Testing Fundamentals →](08-testing-fundamentals.md)** - Testing strategy
2. **[🔧 Unit Testing →](09-unit-testing.md)** - Deep dive testing
3. **[⚡ Best Practices →](11-best-practices.md)** - Production patterns

---

## 💡 Key Takeaways

- **Middleware = Cross-cutting Concerns** yang reusable
- **Order is Critical** - middleware dijalankan secara sequence
- **Error Handling** harus comprehensive dan centralized
- **Security** diimplementasikan melalui middleware stack
- **Testing** middleware secara isolated dan integrated

**Next Chapter: [08 - Testing Fundamentals →](08-testing-fundamentals.md)**
