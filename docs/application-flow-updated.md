# Application Flow Documentation

> **Status**: ✅ **VERIFIED & WORKING**
> 
> Dokumentasi ini menjelaskan alur request-response yang sudah teruji dan berfungsi dengan baik dalam Recipe API.

## Overview

Recipe API menggunakan **Layered Architecture** dengan middleware stack yang komprehensif. Setiap request melalui beberapa tahap processing yang terstruktur dan dapat di-trace dengan mudah.

## ✅ Middleware Stack (Urutan Penting!)

Urutan middleware sangat critical untuk fungsi yang proper:

```javascript
// File: src/app.js
// Apply middleware in correct order
app.use(cors);           // 1. CORS first
app.use(express.json()); // 2. Parse JSON body FIRST  
app.use(logger);         // 3. Log all requests (after body parsing)

// Apply routes
app.use('/api/recipes', recipeRoutes);

// Error handling (MUST be last)
app.use('*', notFoundHandler);
app.use(errorHandler);
```

**⚠️ Critical Learning Point**: Body parsing **HARUS** sebelum logging, karena logger perlu mengakses `req.body` yang sudah di-parse.

## 🔄 Request Flow Diagrams

### ✅ Successful GET Request Flow
```
📱 Client Request: GET /api/recipes
      ↓
🌐 [1] CORS Middleware ✅
      ↓
📝 [2] express.json() ✅ (skip for GET - no body)
      ↓ 
📋 [3] Logger Middleware ✅
      │   → Log: [2025-06-29T12:04:44.828Z] GET /api/recipes - curl/8.11.0
      ↓
🎯 [4] Route Handler (/api/recipes) ✅
      ↓
🎮 [5] Controller (recipeController.getAllRecipes) ✅
      ↓
⚙️ [6] Service Layer (recipeService.getAllRecipes) ✅
      │   → Business logic: transform data
      ↓
🗄️ [7] Repository Layer (recipeRepository.findAll) ✅
      ↓
💾 [8] Database Query (MySQL) ✅
      │   → SELECT * FROM recipes
      ↓
🔄 [9] Transform Data (Service) ✅
      │   → Format response structure
      ↓
📤 [10] JSON Response ✅
      ↓
📋 [11] Logger captures response ✅
      │    → Log: [2025-06-29T12:04:44.828Z] GET /api/recipes - 200 - 44ms
      ↓
📱 Client receives response ✅
```

### ✅ Successful POST Request Flow
```
📱 Client POST Request: POST /api/recipes + JSON body
      ↓
🌐 [1] CORS Middleware ✅
      ↓
📝 [2] express.json() ✅ **CRITICAL STEP**
      │   → Parse raw JSON string into req.body object
      ↓
📋 [3] Logger Middleware ✅
      │   → Log: [2025-06-29T12:09:39.217Z] POST /api/recipes - curl/8.11.0
      │   → Log: Request Body: { title: "...", ingredients: [...], ... }
      ↓
🎯 [4] Route Handler (/api/recipes) ✅
      ↓
✅ [5] Validation Middleware ✅ (validateRecipe)
      │   → Check: title exists and length >= 3
      │   → Check: ingredients is array with length >= 1  
      │   → Check: instructions is array with length >= 1
      ↓
🎮 [6] Controller (recipeController.createRecipe) ✅
      ↓
⚙️ [7] Service Layer (recipeService.createRecipe) ✅
      │   → Additional validation (business rules)
      │   → Clean/transform data
      ↓ 
🗄️ [8] Repository Layer (recipeRepository.create) ✅
      │   → Convert arrays to JSON strings: JSON.stringify(ingredients)
      ↓
💾 [9] Database INSERT (MySQL) ✅
      │   → INSERT INTO recipes (title, description, ingredients, instructions) 
      │   → VALUES (?, ?, ?, ?) with JSON strings
      ↓
🔍 [10] Fetch created record ✅
      │    → SELECT * FROM recipes WHERE id = insertId
      ↓
📤 [11] JSON Response ✅
      ↓
📋 [12] Logger captures response ✅
      │    → Log: [2025-06-29T12:09:39.217Z] POST /api/recipes - 200 - 46ms  
      ↓
📱 Client receives response ✅
```

### ❌ Error Flow (Validation Failure)
```
📱 Client POST Request (invalid data)
      ↓
🌐 [1-3] Middleware Stack ✅
      ↓
🎯 [4] Route Handler ✅
      ↓
❌ [5] Validation Middleware FAILS
      │   → Error: "Title is required" or "Ingredients must be an array"
      │   → throw new Error(message)
      ↓
🛡️ [6] Error Handler Middleware ✅ (catches error)
      │   → Determine status code: 400 (validation error)
      │   → Format error response
      ↓
📋 [7] Logger captures error ✅
      │   → Log: Error occurred: ValidationError: Title is required
      ↓
📤 [8] JSON Error Response ✅
      │   → { success: false, message: "Title is required", ... }
      ↓
📱 Client receives error response ✅
```

## 🏗️ Layer Responsibilities

### 1. **Controller Layer** (`src/controllers/`)
**Responsibility**: HTTP request/response handling
```javascript
// Example: recipeController.js
const createRecipe = async (req, res, next) => {
  try {
    // Extract data from request
    const result = await recipeService.createRecipe(req.body);
    
    // Send HTTP response
    res.status(201).json(result);
  } catch (error) {
    // Pass error to error handler
    next(error);
  }
};
```

### 2. **Service Layer** (`src/services/`)
**Responsibility**: Business logic & validation
```javascript
// Example: recipeService.js
async createRecipe(recipeData) {
  // Business validation
  const errors = this.validateRecipeData(recipeData);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Data transformation
  const cleanData = {
    title: recipeData.title.trim(),
    ingredients: recipeData.ingredients, // Keep as array
    // ...
  };

  // Call repository
  return await recipeRepository.create(cleanData);
}
```

### 3. **Repository Layer** (`src/repositories/`)
**Responsibility**: Database operations only
```javascript
// Example: recipeRepository.js
async create(recipeData) {
  const { title, description, ingredients, instructions } = recipeData;
  
  // Database operation with JSON conversion
  const [result] = await db.query(
    'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
    [title, description, JSON.stringify(ingredients), JSON.stringify(instructions)]
  );
  
  return this.findById(result.insertId);
}
```

### 4. **Middleware Layer** (`src/middleware/`)
**Responsibility**: Cross-cutting concerns

#### Logger Middleware
```javascript
// Logs request details
console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

// Logs request body for debugging
if (req.method === 'POST' || req.method === 'PUT') {
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
}
```

#### Validation Middleware
```javascript
// Validates request data before reaching controller
if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
  errors.push('Ingredients are required and must be an array');
}
```

#### Error Handler
```javascript
// Centralized error handling
if (err.message.includes('not found')) {
  statusCode = 404;
} else if (err.message.includes('required')) {
  statusCode = 400;
}
```

## 🎯 Key Learning Points

### 1. **Middleware Order Matters**
```javascript
// ❌ WRONG - Logger can't access parsed body
app.use(logger);         
app.use(express.json()); 

// ✅ CORRECT - Body parsed first
app.use(express.json()); 
app.use(logger);         
```

### 2. **Data Type Consistency**
- **Frontend sends**: `ingredients: ["item1", "item2"]` (Array)
- **Validation expects**: Array
- **Service processes**: Array
- **Database stores**: JSON string (via `JSON.stringify()`)
- **Database returns**: JSON string
- **API responds**: JSON string (client parses automatically)

### 3. **Error Propagation**
```javascript
// Controller level
try {
  // business logic
} catch (error) {
  next(error); // Pass to error handler
}

// Service level  
if (validationFails) {
  throw new Error('Validation message'); // Bubbles up
}
```

### 4. **Separation of Concerns**
- **Controller**: HTTP handling only
- **Service**: Business logic & validation
- **Repository**: Database operations only
- **Middleware**: Cross-cutting concerns

## 🛠️ Debugging Tips

### 1. **Follow the Logs**
```bash
# In terminal, watch for:
[2025-06-29T12:09:39.217Z] POST /api/recipes - curl/8.11.0
Request Body: { "title": "...", ... }
Error occurred: ValidationError: Title is required
[2025-06-29T12:09:39.217Z] POST /api/recipes - 400 - 5ms
```

### 2. **Trace Through Layers**
1. Does request reach middleware? (check CORS logs)
2. Is body parsed? (check logger output)
3. Does validation pass? (check validation errors)
4. Does service logic work? (check service errors)
5. Does database query succeed? (check repository errors)

### 3. **Common Debug Points**
- `console.log('req.body:', req.body)` in middleware
- `console.log('cleanData:', cleanData)` in service
- `console.log('SQL values:', [title, ingredients])` in repository

## 📊 Performance Metrics

Aplikasi melakukan logging response time otomatis:
```bash
[2025-06-29T12:04:44.828Z] GET /api/recipes - 200 - 44ms      # Fast read
[2025-06-29T12:09:39.217Z] POST /api/recipes - 200 - 46ms     # Database write
[2025-06-29T12:04:54.407Z] GET /api/recipes/1 - 200 - 3ms     # Cached/indexed read
```

---

*Dokumentasi ini mencerminkan implementasi actual yang sudah teruji dan berfungsi dengan baik. Setiap flow sudah diverifikasi melalui testing manual dan debugging yang ekstensif.*
