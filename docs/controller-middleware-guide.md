# 🌐 Controller & Middleware Layers - Pembelajaran Dasar

> **Panduan lengkap memahami Controller dan Middleware Layers dalam Layered Architecture**

## 🎯 Tujuan Pembelajaran

Setelah mempelajari dokumentasi ini, Anda akan memahami:
- Apa itu Controller Layer dan perannya dalam aplikasi
- Apa itu Middleware Layer dan implementasinya
- Cara menghandle HTTP requests dan responses
- Cross-cutting concerns dan implementasinya
- Testing strategy untuk kedua layer
- Best practices dan common pitfalls

---

# 🌐 PART 1: Controller Layer

## 🤔 Apa itu Controller Layer?

### 📋 **Definisi**
Controller adalah layer yang bertanggung jawab untuk menangani HTTP requests dan responses. Controller bertindak sebagai interface antara dunia luar (HTTP) dan business logic internal aplikasi.

### 🏗️ **Posisi dalam Arsitektur**
```
HTTP Request → CONTROLLER → Service → Repository → Model → Database
```

Controller adalah entry point pertama setelah middleware untuk semua requests.

### 🎭 **Analogi Sederhana**
Controller seperti **resepsionis hotel**:
- **Tamu (HTTP Request)**: Datang dengan permintaan
- **Resepsionis (Controller)**: Menerima permintaan, memvalidasi, dan mengarahkan ke departemen yang tepat
- **Manager (Service)**: Mengatur business logic
- **Staff (Repository)**: Mengakses data yang dibutuhkan

---

## 📝 Tanggung Jawab Controller Layer

### ✅ **Yang HARUS dilakukan Controller:**
1. **HTTP Request Handling**: Parse dan validate HTTP requests
2. **Response Formatting**: Format data untuk HTTP responses
3. **Status Code Management**: Set appropriate HTTP status codes
4. **Parameter Extraction**: Extract data dari URL, query, body
5. **Error Handling**: Handle dan format errors untuk client
6. **Input Validation**: Basic input validation dan sanitization
7. **Authentication Check**: Verify authentication (with middleware)

### ❌ **Yang TIDAK boleh dilakukan Controller:**
1. **Business Logic**: Complex business rules (tugas Service)
2. **Database Operations**: Direct database access (tugas Repository)
3. **Data Transformation**: Complex data processing (tugas Service/Model)
4. **External API Calls**: Direct external service calls (tugas Service)

---

## 🔍 Implementasi Controller Layer

### 📦 **Basic Controller Structure**

```javascript
// src/controllers/recipeController.js
class RecipeController {
  constructor(recipeService) {
    this.recipeService = recipeService;
    
    // Bind methods to preserve 'this' context
    this.getAllRecipes = this.getAllRecipes.bind(this);
    this.getRecipeById = this.getRecipeById.bind(this);
    this.createRecipe = this.createRecipe.bind(this);
    this.updateRecipe = this.updateRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }

  // GET /api/recipes
  async getAllRecipes(req, res, next) {
    try {
      // Extract query parameters
      const options = this.extractListOptions(req.query);
      const userId = req.user?.id; // From authentication middleware
      
      // Validate pagination parameters
      const validationResult = this.validatePaginationParams(options);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          details: validationResult.errors
        });
      }

      // Call service
      const result = await this.recipeService.getAllRecipes(userId, options);
      
      // Format successful response
      res.status(200).json({
        success: true,
        data: result.recipes,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 50,
          total: result.total,
          has_more: result.recipes.length === (options.limit || 50)
        },
        meta: {
          user_preferences: result.user_preferences,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  }

  // GET /api/recipes/:id
  async getRecipeById(req, res, next) {
    try {
      // Extract and validate ID parameter
      const { id } = req.params;
      const parsedId = this.parseAndValidateId(id);
      
      if (!parsedId.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipe ID format',
          details: parsedId.error
        });
      }

      const userId = req.user?.id;
      
      // Call service
      const result = await this.recipeService.getRecipeById(parsedId.value, userId);
      
      // Format successful response
      res.status(200).json({
        success: true,
        data: result.recipe,
        meta: {
          related_recipes: result.related_recipes,
          view_count: result.view_count,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/recipes
  async createRecipe(req, res, next) {
    try {
      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }

      // Check content type
      if (!req.is('application/json')) {
        return res.status(400).json({
          success: false,
          error: 'Content-Type must be application/json'
        });
      }

      // Extract user ID (required for creation)
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Validate payload size
      const payloadSize = JSON.stringify(req.body).length;
      if (payloadSize > 10000) { // 10KB limit
        return res.status(413).json({
          success: false,
          error: 'Request payload too large'
        });
      }

      // Sanitize input data
      const sanitizedData = this.sanitizeRecipeInput(req.body);
      
      // Call service
      const result = await this.recipeService.createRecipe(userId, sanitizedData);
      
      // Format successful response
      res.status(201).json({
        success: true,
        data: result.recipe,
        message: result.message,
        meta: {
          created_at: new Date().toISOString(),
          created_by: userId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/recipes/:id
  async updateRecipe(req, res, next) {
    try {
      // Extract and validate ID
      const { id } = req.params;
      const parsedId = this.parseAndValidateId(id);
      
      if (!parsedId.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipe ID format'
        });
      }

      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body with update data is required'
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeRecipeInput(req.body);
      
      // Call service
      const result = await this.recipeService.updateRecipe(parsedId.value, userId, sanitizedData);
      
      // Format successful response
      res.status(200).json({
        success: true,
        data: result.recipe,
        message: result.message,
        meta: {
          updated_at: new Date().toISOString(),
          updated_by: userId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/recipes/:id
  async deleteRecipe(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = this.parseAndValidateId(id);
      
      if (!parsedId.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipe ID format'
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Call service
      const result = await this.recipeService.deleteRecipe(parsedId.value, userId);
      
      // Format successful response
      res.status(200).json({
        success: true,
        message: result.message,
        meta: {
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  extractListOptions(query) {
    return {
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 50, 100), // Max 100
      search: query.search?.trim(),
      difficulty: query.difficulty,
      max_cooking_time: parseInt(query.max_cooking_time),
      sort_by: query.sort_by || 'created_at',
      sort_order: (query.sort_order || 'desc').toLowerCase()
    };
  }

  validatePaginationParams(options) {
    const errors = [];
    
    if (options.page < 1) {
      errors.push('Page must be greater than 0');
    }
    
    if (options.limit < 1 || options.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }
    
    const validSortFields = ['created_at', 'updated_at', 'title', 'cooking_time', 'rating'];
    if (!validSortFields.includes(options.sort_by)) {
      errors.push(`Sort field must be one of: ${validSortFields.join(', ')}`);
    }
    
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(options.sort_order)) {
      errors.push(`Sort order must be one of: ${validSortOrders.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  parseAndValidateId(id) {
    const parsedId = parseInt(id);
    
    if (isNaN(parsedId) || parsedId <= 0) {
      return {
        isValid: false,
        error: 'ID must be a positive integer'
      };
    }
    
    return {
      isValid: true,
      value: parsedId
    };
  }

  sanitizeRecipeInput(data) {
    const sanitized = {};
    
    // Sanitize string fields
    if (data.title) {
      sanitized.title = data.title.toString().trim().substring(0, 100);
    }
    
    if (data.ingredients) {
      sanitized.ingredients = data.ingredients.toString().trim().substring(0, 2000);
    }
    
    if (data.instructions) {
      sanitized.instructions = data.instructions.toString().trim().substring(0, 5000);
    }
    
    // Sanitize numeric fields
    if (data.cooking_time !== undefined) {
      const cookingTime = parseInt(data.cooking_time);
      if (!isNaN(cookingTime) && cookingTime >= 0) {
        sanitized.cooking_time = Math.min(cookingTime, 1440); // Max 1 day
      }
    }
    
    // Sanitize enum fields
    if (data.difficulty) {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (validDifficulties.includes(data.difficulty)) {
        sanitized.difficulty = data.difficulty;
      }
    }
    
    return sanitized;
  }
}

module.exports = RecipeController;
```

### 🔧 **Advanced Controller Features**

```javascript
class RecipeController {
  // ... previous methods ...

  // Advanced search endpoint
  async searchRecipes(req, res, next) {
    try {
      const searchParams = this.extractSearchParams(req.query);
      
      // Validate search parameters
      const validation = this.validateSearchParams(searchParams);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: validation.errors
        });
      }

      const userId = req.user?.id;
      const result = await this.recipeService.searchRecipes(searchParams, userId);
      
      res.status(200).json({
        success: true,
        data: result.recipes,
        search_meta: {
          query: searchParams,
          total_results: result.total,
          search_time_ms: result.search_time,
          suggestions: result.suggestions
        },
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total_pages: Math.ceil(result.total / searchParams.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Batch operations endpoint
  async batchOperations(req, res, next) {
    try {
      const { operation, recipe_ids } = req.body;
      
      // Validate batch request
      if (!operation || !Array.isArray(recipe_ids)) {
        return res.status(400).json({
          success: false,
          error: 'Operation and recipe_ids array are required'
        });
      }

      if (recipe_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one recipe ID is required'
        });
      }

      if (recipe_ids.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 50 recipes can be processed at once'
        });
      }

      const userId = req.user?.id;
      const result = await this.recipeService.batchProcessRecipes(recipe_ids, operation, userId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Batch operation '${operation}' completed`
      });
    } catch (error) {
      next(error);
    }
  }

  // File upload endpoint
  async uploadRecipeImage(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = this.parseAndValidateId(id);
      
      if (!parsedId.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipe ID format'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Image file is required'
        });
      }

      // Validate file type and size (handled by middleware, but double-check)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only JPEG, PNG, and WebP images are allowed'
        });
      }

      const userId = req.user?.id;
      const result = await this.recipeService.uploadRecipeImage(parsedId.value, userId, req.file);
      
      res.status(200).json({
        success: true,
        data: {
          image_url: result.image_url,
          thumbnail_url: result.thumbnail_url
        },
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Analytics endpoint
  async getRecipeAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = this.parseAndValidateId(id);
      
      if (!parsedId.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipe ID format'
        });
      }

      const userId = req.user?.id;
      const result = await this.recipeService.getRecipeAnalytics(parsedId.value, userId);
      
      res.status(200).json({
        success: true,
        data: result.analytics,
        meta: {
          recipe_id: parsedId.value,
          generated_at: result.generated_at,
          data_retention_days: 30
        }
      });
    } catch (error) {
      next(error);
    }
  }

  extractSearchParams(query) {
    return {
      q: query.q?.trim(),
      title: query.title?.trim(),
      ingredients: query.ingredients?.trim(),
      difficulty: query.difficulty,
      min_cooking_time: parseInt(query.min_cooking_time),
      max_cooking_time: parseInt(query.max_cooking_time),
      cuisine: query.cuisine,
      dietary_restrictions: query.dietary_restrictions?.split(',').map(s => s.trim()),
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 20, 50),
      sort_by: query.sort_by || 'relevance',
      sort_order: (query.sort_order || 'desc').toLowerCase()
    };
  }

  validateSearchParams(params) {
    const errors = [];
    
    // At least one search criteria must be provided
    const hasSearchCriteria = params.q || params.title || params.ingredients || 
                             params.difficulty || params.cuisine;
    
    if (!hasSearchCriteria) {
      errors.push('At least one search criteria must be provided');
    }
    
    // Validate search query length
    if (params.q && (params.q.length < 2 || params.q.length > 100)) {
      errors.push('Search query must be between 2 and 100 characters');
    }
    
    // Validate cooking time range
    if (params.min_cooking_time && params.max_cooking_time) {
      if (params.min_cooking_time > params.max_cooking_time) {
        errors.push('Minimum cooking time cannot be greater than maximum');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

---

# 🛡️ PART 2: Middleware Layer

## 🤔 Apa itu Middleware Layer?

### 📋 **Definisi**
Middleware adalah fungsi yang dieksekusi secara berurutan dalam request-response cycle. Middleware menangani cross-cutting concerns yang perlu diterapkan di banyak endpoints.

### 🏗️ **Posisi dalam Arsitektur**
```
HTTP Request → MIDDLEWARE → Controller → Service → Repository
             ↓
           CORS, Auth, Logging, Validation, Error Handling
```

### 🎭 **Analogi Sederhana**
Middleware seperti **security checkpoint di bandara**:
- **Check-in (CORS)**: Verifikasi asal penerbangan
- **Security scan (Authentication)**: Verifikasi identitas
- **Baggage check (Validation)**: Periksa isi bagasi
- **Boarding pass (Logging)**: Catat siapa yang masuk
- **Emergency procedures (Error Handling)**: Handle masalah yang terjadi

---

## 📝 Jenis-jenis Middleware

### 🔒 **Authentication Middleware**

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        let errorMessage = 'Invalid access token';
        let errorCode = 'TOKEN_INVALID';

        if (err.name === 'TokenExpiredError') {
          errorMessage = 'Access token has expired';
          errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          errorMessage = 'Malformed access token';
          errorCode = 'TOKEN_MALFORMED';
        }

        return res.status(403).json({
          success: false,
          error: errorMessage,
          code: errorCode
        });
      }

      // Add user info to request
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user info
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    // Continue regardless of token validity
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth
};
```

### 🌐 **CORS Middleware**

```javascript
// src/middleware/cors.js
const corsMiddleware = (req, res, next) => {
  // Allow origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://myrecipeapp.com',
    'https://www.myrecipeapp.com'
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  // Allow methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow headers
  res.setHeader('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
  );

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Cache preflight response
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

module.exports = corsMiddleware;
```

### 📊 **Logging Middleware**

```javascript
// src/middleware/logger.js
const fs = require('fs').promises;
const path = require('path');

class RequestLogger {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  createLogMiddleware() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Add request ID to request object
      req.requestId = requestId;

      // Log request
      const requestLog = {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        user_agent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        user_id: req.user?.id || null,
        body_size: req.get('Content-Length') || 0
      };

      await this.writeLog('requests', requestLog);

      // Capture response data
      const originalSend = res.send;
      let responseBody = '';

      res.send = function(data) {
        responseBody = data;
        originalSend.call(this, data);
      };

      // Log response when finished
      res.on('finish', async () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const responseLog = {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          status_code: res.statusCode,
          response_time_ms: responseTime,
          response_size: Buffer.byteLength(responseBody || '', 'utf8'),
          success: res.statusCode < 400
        };

        await this.writeLog('responses', responseLog);

        // Log errors separately
        if (res.statusCode >= 400) {
          const errorLog = {
            request_id: requestId,
            timestamp: new Date().toISOString(),
            status_code: res.statusCode,
            method: req.method,
            url: req.url,
            user_id: req.user?.id || null,
            response_body: responseBody
          };

          await this.writeLog('errors', errorLog);
        }
      });

      next();
    };
  }

  async writeLog(type, data) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `${type}-${today}.log`;
      const filepath = path.join(this.logDir, filename);
      
      const logLine = JSON.stringify(data) + '\n';
      await fs.appendFile(filepath, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  generateRequestId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Simple console logger for development
const simpleLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${logLevel} ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`);
  });

  next();
};

module.exports = {
  RequestLogger,
  simpleLogger
};
```

### ✅ **Validation Middleware**

```javascript
// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }
  
  next();
};

// Recipe validation rules
const recipeValidationRules = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-&!(),.']+$/)
      .withMessage('Title contains invalid characters'),
    
    body('ingredients')
      .notEmpty()
      .withMessage('Ingredients are required')
      .isLength({ max: 2000 })
      .withMessage('Ingredients must not exceed 2000 characters'),
    
    body('instructions')
      .notEmpty()
      .withMessage('Instructions are required')
      .isLength({ max: 5000 })
      .withMessage('Instructions must not exceed 5000 characters'),
    
    body('cooking_time')
      .optional()
      .isInt({ min: 0, max: 1440 })
      .withMessage('Cooking time must be between 0 and 1440 minutes'),
    
    body('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Difficulty must be Easy, Medium, or Hard'),
    
    body('servings')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Servings must be between 1 and 20'),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Recipe ID must be a positive integer'),
    
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-&!(),.']+$/)
      .withMessage('Title contains invalid characters'),
    
    body('ingredients')
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Ingredients must be between 1 and 2000 characters'),
    
    body('instructions')
      .optional()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Instructions must be between 1 and 5000 characters'),
    
    body('cooking_time')
      .optional()
      .isInt({ min: 0, max: 1440 })
      .withMessage('Cooking time must be between 0 and 1440 minutes'),
    
    body('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Difficulty must be Easy, Medium, or Hard'),
    
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Recipe ID must be a positive integer'),
    
    handleValidationErrors
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort_by')
      .optional()
      .isIn(['created_at', 'updated_at', 'title', 'cooking_time', 'rating'])
      .withMessage('Invalid sort field'),
    
    query('sort_order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    
    query('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Invalid difficulty level'),
    
    query('max_cooking_time')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max cooking time must be a positive integer'),
    
    handleValidationErrors
  ]
};

// Rate limiting validation
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }

    requests.push(now);
    next();
  };
};

module.exports = {
  recipeValidationRules,
  handleValidationErrors,
  rateLimitByUser
};
```

### 🚨 **Error Handling Middleware**

```javascript
// src/middleware/errorHandler.js
const errorHandler = (error, req, res, next) => {
  let status = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  // Log error for debugging (except in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`);
    console.error(error.stack || error.message);
  }

  // Handle specific error types
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    // JSON parsing error
    status = 400;
    message = 'Invalid JSON format in request body';
    code = 'INVALID_JSON';
  } 
  else if (error.message && error.message.includes('Validation failed')) {
    // Validation errors from Service layer
    status = 400;
    message = error.message;
    code = 'VALIDATION_ERROR';
  }
  else if (error.message && error.message.includes('not found')) {
    // Not found errors
    status = 404;
    message = error.message;
    code = 'NOT_FOUND';
  }
  else if (error.message && error.message.includes('not authorized')) {
    // Authorization errors
    status = 403;
    message = error.message;
    code = 'FORBIDDEN';
  }
  else if (error.message && error.message.includes('already exists')) {
    // Duplicate resource errors
    status = 409;
    message = error.message;
    code = 'CONFLICT';
  }
  else if (error.message && error.message.includes('Database')) {
    // Database errors (don't expose details in production)
    status = 500;
    message = process.env.NODE_ENV === 'production' 
      ? 'Database operation failed' 
      : error.message;
    code = 'DATABASE_ERROR';
  }
  else if (error.message) {
    // Generic application errors
    if (error.message.includes('Invalid')) {
      status = 400;
      code = 'INVALID_INPUT';
    } else if (error.message.includes('required')) {
      status = 400;
      code = 'MISSING_REQUIRED';
    }
    message = error.message;
  }

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    details = {
      stack: error.stack,
      timestamp: new Date().toISOString(),
      request_id: req.requestId
    };
  }

  // Format error response
  const errorResponse = {
    success: false,
    error: message,
    code: code,
    ...(details && { details })
  };

  res.status(status).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
```

---

## 🧪 Testing Controller & Middleware

### 🎯 **Testing Controller**

```javascript
// tests/unit/recipeController.test.js
const RecipeController = require('../../src/controllers/recipeController');

describe('RecipeController', () => {
  let controller;
  let mockService;
  let req, res, next;

  beforeEach(() => {
    mockService = {
      getAllRecipes: jest.fn(),
      getRecipeById: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn()
    };

    controller = new RecipeController(mockService);

    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 1 },
      is: jest.fn()
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('getAllRecipes', () => {
    test('should return recipes with proper formatting', async () => {
      const mockResult = {
        recipes: [{ id: 1, title: 'Recipe 1' }],
        total: 1,
        user_preferences: {}
      };

      mockService.getAllRecipes.mockResolvedValue(mockResult);

      await controller.getAllRecipes(req, res, next);

      expect(mockService.getAllRecipes).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.recipes,
        pagination: expect.any(Object),
        meta: expect.any(Object)
      });
    });

    test('should validate pagination parameters', async () => {
      req.query = { page: '0', limit: '200' };

      await controller.getAllRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid pagination parameters',
        details: expect.arrayContaining([
          'Page must be greater than 0',
          'Limit must be between 1 and 100'
        ])
      });
    });

    test('should handle service errors', async () => {
      const serviceError = new Error('Service error');
      mockService.getAllRecipes.mockRejectedValue(serviceError);

      await controller.getAllRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getRecipeById', () => {
    test('should return recipe when found', async () => {
      req.params.id = '1';
      const mockResult = {
        recipe: { id: 1, title: 'Recipe 1' },
        related_recipes: [],
        view_count: 10
      };

      mockService.getRecipeById.mockResolvedValue(mockResult);

      await controller.getRecipeById(req, res, next);

      expect(mockService.getRecipeById).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.recipe,
        meta: expect.objectContaining({
          related_recipes: mockResult.related_recipes,
          view_count: mockResult.view_count
        })
      });
    });

    test('should validate ID parameter', async () => {
      req.params.id = 'invalid';

      await controller.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid recipe ID format',
        details: 'ID must be a positive integer'
      });
    });
  });

  describe('createRecipe', () => {
    test('should create recipe with valid data', async () => {
      req.body = { title: 'New Recipe', ingredients: 'ingredients' };
      req.is.mockReturnValue(true);

      const mockResult = {
        recipe: { id: 1, title: 'New Recipe' },
        message: 'Recipe created successfully'
      };

      mockService.createRecipe.mockResolvedValue(mockResult);

      await controller.createRecipe(req, res, next);

      expect(mockService.createRecipe).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.recipe,
        message: mockResult.message,
        meta: expect.any(Object)
      });
    });

    test('should validate request body', async () => {
      req.body = {};

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Request body is required'
      });
    });

    test('should validate content type', async () => {
      req.body = { title: 'Recipe' };
      req.is.mockReturnValue(false);

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Content-Type must be application/json'
      });
    });

    test('should require authentication', async () => {
      req.user = null;
      req.body = { title: 'Recipe' };
      req.is.mockReturnValue(true);

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });
  });
});
```

### 🎯 **Testing Middleware**

```javascript
// tests/unit/middleware/auth.test.js
const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../../src/middleware/auth');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateToken', () => {
    test('should authenticate valid token', () => {
      req.headers.authorization = 'Bearer valid-token';
      const mockUser = { id: 1, email: 'test@example.com' };
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should reject missing token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle expired token', () => {
      req.headers.authorization = 'Bearer expired-token';
      
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(expiredError, null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token has expired',
        code: 'TOKEN_EXPIRED'
      });
    });
  });

  describe('optionalAuth', () => {
    test('should continue without token', () => {
      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should set user if valid token provided', () => {
      req.headers.authorization = 'Bearer valid-token';
      const mockUser = { id: 1, email: 'test@example.com' };
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should continue even with invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});

// tests/unit/middleware/errorHandler.test.js
const { errorHandler, notFoundHandler } = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/test',
      requestId: 'test-request-id'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Mock console methods
    console.error = jest.fn();
  });

  test('should handle validation errors', () => {
    const error = new Error('Validation failed: Title is required');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed: Title is required',
      code: 'VALIDATION_ERROR'
    });
  });

  test('should handle not found errors', () => {
    const error = new Error('Recipe not found');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Recipe not found',
      code: 'NOT_FOUND'
    });
  });

  test('should handle JSON parsing errors', () => {
    const error = new SyntaxError('Unexpected token in JSON');
    error.status = 400;
    error.body = {};

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid JSON format in request body',
      code: 'INVALID_JSON'
    });
  });

  test('should handle generic errors', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    });
  });

  test('should include details in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error',
      code: 'INTERNAL_ERROR',
      details: {
        stack: 'Error stack trace',
        timestamp: expect.any(String),
        request_id: 'test-request-id'
      }
    });

    process.env.NODE_ENV = 'test'; // Reset
  });

  test('should suppress logs in test environment', () => {
    process.env.NODE_ENV = 'test';
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(console.error).not.toHaveBeenCalled();
  });
});

describe('Not Found Handler', () => {
  test('should handle 404 routes', () => {
    const req = { method: 'GET', url: '/api/nonexistent' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Route GET /api/nonexistent not found',
      code: 'ROUTE_NOT_FOUND'
    });
  });
});
```

---

## 🚀 Best Practices & Common Pitfalls

### ✅ **Best Practices**

#### **1. Controller Best Practices**
```javascript
// ✅ Good - Thin controllers
class RecipeController {
  async createRecipe(req, res, next) {
    try {
      // Basic validation only
      if (!req.body) {
        return res.status(400).json({ error: 'Body required' });
      }

      // Delegate to service
      const result = await this.recipeService.createRecipe(req.user.id, req.body);
      
      // Format response
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

// ❌ Bad - Fat controllers with business logic
class RecipeController {
  async createRecipe(req, res, next) {
    try {
      // Complex validation logic - should be in service/model
      if (!req.body.title || req.body.title.length < 3) {
        return res.status(400).json({ error: 'Invalid title' });
      }

      // Business logic - should be in service
      const existingRecipe = await this.repository.findByTitle(req.body.title);
      if (existingRecipe) {
        return res.status(409).json({ error: 'Duplicate' });
      }

      // Database operations - should be in repository
      const recipe = await this.db.execute('INSERT INTO...');
      
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  }
}
```

#### **2. Middleware Best Practices**
```javascript
// ✅ Good - Focused middleware
const authenticate = (req, res, next) => {
  // Single responsibility: authentication only
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  verifyToken(token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => next(error));
};

// ❌ Bad - Middleware doing too much
const authAndLog = (req, res, next) => {
  // Multiple responsibilities - hard to test and reuse
  console.log(`${req.method} ${req.url}`); // Logging
  
  const token = extractToken(req);
  if (!token) {
    console.log('No token provided'); // More logging
    return res.status(401).json({ error: 'Token required' });
  }
  
  verifyToken(token)
    .then(user => {
      req.user = user;
      console.log(`User ${user.id} authenticated`); // Even more logging
      next();
    })
    .catch(error => {
      console.error('Auth error:', error); // Error logging
      next(error);
    });
};
```

### 🚫 **Common Pitfalls**

#### **1. Not Handling Async Errors**
```javascript
// ❌ Bad - Unhandled promise rejection
app.get('/recipes', async (req, res) => {
  const recipes = await recipeService.getAllRecipes();
  res.json(recipes); // If service throws, app will crash
});

// ✅ Good - Proper error handling
app.get('/recipes', async (req, res, next) => {
  try {
    const recipes = await recipeService.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    next(error); // Pass to error middleware
  }
});
```

#### **2. Inconsistent Response Formats**
```javascript
// ❌ Bad - Inconsistent responses
app.get('/recipes', (req, res) => {
  res.json(recipes); // Sometimes array
});

app.get('/recipes/:id', (req, res) => {
  res.json({ data: recipe, success: true }); // Sometimes object
});

// ✅ Good - Consistent response format
app.get('/recipes', (req, res) => {
  res.json({ success: true, data: recipes });
});

app.get('/recipes/:id', (req, res) => {
  res.json({ success: true, data: recipe });
});
```

#### **3. Not Validating Input**
```javascript
// ❌ Bad - No input validation
app.post('/recipes', async (req, res) => {
  const recipe = await recipeService.create(req.body); // Direct use of req.body
  res.json(recipe);
});

// ✅ Good - Input validation and sanitization
app.post('/recipes', validateRecipeInput, async (req, res, next) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const recipe = await recipeService.create(sanitizedData);
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
});
```

---

## 🎯 Summary

### ✅ **Key Takeaways**

#### **Controller Layer:**
- Handle HTTP requests and responses only
- Keep controllers thin, delegate to services
- Validate input and format output consistently
- Use proper HTTP status codes
- Handle errors gracefully

#### **Middleware Layer:**
- Handle cross-cutting concerns (auth, logging, CORS, etc.)
- Keep middleware focused on single responsibility
- Order middleware carefully
- Use error handling middleware as last resort
- Test middleware independently

### 📚 **Next Steps:**
1. Study integration testing for full request-response cycle
2. Learn about API versioning strategies
3. Explore advanced security middleware (helmet, rate limiting)
4. Implement caching middleware
5. Learn about API documentation (OpenAPI/Swagger)

---

*Happy Controller & Middleware Building! 🌐🛡️✨*

> **Remember:** Controller adalah gerbang masuk aplikasi, dan Middleware adalah penjaga yang memastikan semua berjalan dengan aman dan lancar. Desain yang baik di kedua layer ini akan membuat API Anda robust dan user-friendly.
