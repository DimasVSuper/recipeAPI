# 🎛️ Controller Layer Deep Dive

> **Mastering HTTP Request/Response Handling**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Peran dan tanggung jawab Controller layer
- ✅ Cara menangani HTTP requests dengan proper
- ✅ Best practices untuk error handling di controller
- ✅ Input validation dan sanitization
- ✅ Response formatting yang konsisten

## 🤔 Apa itu Controller Layer?

**Controller Layer** adalah **pintu gerbang** aplikasi yang menerima HTTP requests dari client dan mengembalikan HTTP responses. Layer ini bertindak sebagai **orchestrator** yang menghubungkan HTTP protocol dengan business logic.

### 📊 Controller dalam Arsitektur

```
🌐 CLIENT REQUEST
       ⬇️
🎛️ CONTROLLER LAYER    ← You are here!
       ⬇️
⚙️ SERVICE LAYER
       ⬇️
🗃️ REPOSITORY LAYER
       ⬇️
💾 DATABASE
```

## 🔍 Tanggung Jawab Controller

### ✅ **Primary Responsibilities**

1. **🔄 HTTP Request Handling**
   ```javascript
   async getAllRecipes(req, res, next) {
     // Extract data from req object
     // Process query parameters
     // Handle headers if needed
   }
   ```

2. **📝 Input Validation & Sanitization**
   ```javascript
   const { title, ingredients, instructions } = req.body;
   
   // Basic validation
   if (!title || !ingredients || !instructions) {
     return res.status(400).json({
       success: false,
       message: 'Missing required fields'
     });
   }
   ```

3. **⚙️ Service Layer Orchestration**
   ```javascript
   // Call appropriate service method
   const result = await this.recipeService.getAllRecipes();
   ```

4. **📤 Response Formatting**
   ```javascript
   res.status(200).json({
     success: true,
     message: 'Recipes retrieved successfully',
     data: result,
     timestamp: new Date().toISOString()
   });
   ```

5. **❌ Error Handling**
   ```javascript
   try {
     // Business logic calls
   } catch (error) {
     next(error); // Pass to error middleware
   }
   ```

## 🧩 Anatomy of Recipe Controller

### **File Structure:**
```javascript
// src/controllers/recipeController.js
class RecipeController {
  constructor(recipeService) {
    this.recipeService = recipeService;
  }

  // HTTP Methods
  getAllRecipes = async (req, res, next) => { /* ... */ }
  getRecipeById = async (req, res, next) => { /* ... */ }
  createRecipe = async (req, res, next) => { /* ... */ }
  updateRecipe = async (req, res, next) => { /* ... */ }
  deleteRecipe = async (req, res, next) => { /* ... */ }
}
```

### **Detailed Implementation:**

#### 1. **GET All Recipes**
```javascript
async getAllRecipes(req, res, next) {
  try {
    // 1. Extract query parameters (optional)
    const { page = 1, limit = 10, search } = req.query;
    
    // 2. Call service layer
    const result = await this.recipeService.getAllRecipes({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });
    
    // 3. Format successful response
    res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // 4. Pass error to middleware
    next(error);
  }
}
```

#### 2. **GET Recipe by ID**
```javascript
async getRecipeById(req, res, next) {
  try {
    // 1. Extract route parameters
    const { id } = req.params;
    
    // 2. Basic validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID provided',
        timestamp: new Date().toISOString()
      });
    }
    
    // 3. Call service layer
    const recipe = await this.recipeService.getRecipeById(parseInt(id));
    
    // 4. Format response
    res.status(200).json({
      success: true,
      message: 'Recipe retrieved successfully',
      data: recipe,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
}
```

#### 3. **POST Create Recipe**
```javascript
async createRecipe(req, res, next) {
  try {
    // 1. Extract request body
    const { title, description, ingredients, instructions } = req.body;
    
    // 2. Basic input validation
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, ingredients, instructions',
        timestamp: new Date().toISOString()
      });
    }
    
    // 3. Prepare data object
    const recipeData = {
      title: title.trim(),
      description: description?.trim() || null,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : []
    };
    
    // 4. Call service layer
    const newRecipe = await this.recipeService.createRecipe(recipeData);
    
    // 5. Format success response
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: newRecipe,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
}
```

#### 4. **PUT Update Recipe**
```javascript
async updateRecipe(req, res, next) {
  try {
    // 1. Extract parameters and body
    const { id } = req.params;
    const updateData = req.body;
    
    // 2. Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID provided'
      });
    }
    
    // 3. Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }
    
    // 4. Call service layer
    const updatedRecipe = await this.recipeService.updateRecipe(
      parseInt(id), 
      updateData
    );
    
    // 5. Format response
    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: updatedRecipe,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
}
```

#### 5. **DELETE Recipe**
```javascript
async deleteRecipe(req, res, next) {
  try {
    // 1. Extract ID from params
    const { id } = req.params;
    
    // 2. Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID provided'
      });
    }
    
    // 3. Call service layer
    const deletedRecipe = await this.recipeService.deleteRecipe(parseInt(id));
    
    // 4. Format response
    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
      data: deletedRecipe,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
}
```

## 🛡️ Input Validation Strategies

### **1. Basic Validation in Controller**
```javascript
// Simple required field checks
if (!title || !ingredients) {
  return res.status(400).json({
    success: false,
    message: 'Missing required fields'
  });
}

// Type checking
if (!Array.isArray(ingredients)) {
  return res.status(400).json({
    success: false,
    message: 'Ingredients must be an array'
  });
}
```

### **2. Using Validation Middleware**
```javascript
// src/middleware/validation.js
const validateRecipeInput = (req, res, next) => {
  const { title, ingredients, instructions } = req.body;
  const errors = [];
  
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Usage in routes
router.post('/recipes', validateRecipeInput, recipeController.createRecipe);
```

## 📤 Response Formatting Standards

### **✅ Consistent Response Structure**
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ },
  "timestamp": "2025-07-01T01:30:00.000Z"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)",
  "timestamp": "2025-07-01T01:30:00.000Z",
  "path": "/api/recipes"
}

// Validation Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "Ingredients must be an array"
  ],
  "timestamp": "2025-07-01T01:30:00.000Z"
}
```

### **HTTP Status Codes**
```javascript
// Success codes
200 // OK - GET, PUT, DELETE success
201 // Created - POST success
204 // No Content - DELETE success (no response body)

// Client Error codes
400 // Bad Request - Validation errors
401 // Unauthorized - Authentication required
403 // Forbidden - Not allowed
404 // Not Found - Resource doesn't exist
409 // Conflict - Duplicate resource

// Server Error codes
500 // Internal Server Error - Server issues
503 // Service Unavailable - Temporary issues
```

## ❌ Error Handling Patterns

### **1. Try-Catch in Controllers**
```javascript
async createRecipe(req, res, next) {
  try {
    // Main logic here
    const result = await this.recipeService.createRecipe(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // Always pass to error middleware
    next(error);
  }
}
```

### **2. Early Return for Validation**
```javascript
// Validate and return early
if (!title) {
  return res.status(400).json({
    success: false,
    message: 'Title is required'
  });
}

// Continue with main logic
const result = await this.recipeService.createRecipe(data);
```

### **3. Error Middleware Integration**
```javascript
// Controllers should NOT handle specific errors
// Let error middleware handle them
try {
  const result = await this.recipeService.getRecipeById(id);
  res.json({ success: true, data: result });
} catch (error) {
  // Error middleware will:
  // - Determine appropriate status code
  // - Format error response
  // - Log error details
  next(error);
}
```

## 🎯 Best Practices

### **✅ Do's**

1. **Keep Controllers Thin**
   ```javascript
   // ✅ Good - delegate to service
   async createRecipe(req, res, next) {
     try {
       const result = await this.recipeService.createRecipe(req.body);
       res.status(201).json({ success: true, data: result });
     } catch (error) {
       next(error);
     }
   }
   ```

2. **Use Dependency Injection**
   ```javascript
   // ✅ Good - inject dependencies
   class RecipeController {
     constructor(recipeService) {
       this.recipeService = recipeService;
     }
   }
   ```

3. **Consistent Response Format**
   ```javascript
   // ✅ Use helper function for responses
   const sendSuccess = (res, data, message, statusCode = 200) => {
     res.status(statusCode).json({
       success: true,
       message,
       data,
       timestamp: new Date().toISOString()
     });
   };
   ```

### **❌ Don'ts**

1. **Don't Put Business Logic in Controllers**
   ```javascript
   // ❌ Bad - business logic in controller
   async createRecipe(req, res, next) {
     // Complex validation logic
     // Data transformation
     // Business rules
     // Database operations
   }
   ```

2. **Don't Handle Specific Errors**
   ```javascript
   // ❌ Bad - specific error handling
   try {
     const result = await service.method();
   } catch (error) {
     if (error.code === 'DUPLICATE_ENTRY') {
       return res.status(409).json({...});
     }
     if (error.code === 'NOT_FOUND') {
       return res.status(404).json({...});
     }
   }
   ```

3. **Don't Ignore Error Handling**
   ```javascript
   // ❌ Bad - no error handling
   async createRecipe(req, res) {
     const result = await this.recipeService.createRecipe(req.body);
     res.json(result); // What if service throws error?
   }
   ```

## 🧪 Testing Controllers

### **Unit Test Example:**
```javascript
describe('RecipeController', () => {
  let controller;
  let mockService;
  let req, res, next;

  beforeEach(() => {
    mockService = {
      getAllRecipes: jest.fn(),
      createRecipe: jest.fn()
    };
    
    controller = new RecipeController(mockService);
    
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should create recipe successfully', async () => {
    // Arrange
    const mockRecipe = { id: 1, title: 'Test Recipe' };
    mockService.createRecipe.mockResolvedValue(mockRecipe);
    req.body = { title: 'Test Recipe', ingredients: ['test'] };

    // Act
    await controller.createRecipe(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Recipe created successfully',
      data: mockRecipe,
      timestamp: expect.any(String)
    });
  });
});
```

## 🏋️‍♂️ Exercise

### **Exercise 1: Add Validation**
Tambahkan validation untuk `updateRecipe` method:
- Validate ID parameter
- Validate at least one field is provided
- Handle empty update object

### **Exercise 2: Implement Pagination**
Modify `getAllRecipes` to support:
- Page and limit query parameters
- Default values
- Response metadata

### **Exercise 3: Add Search Feature**
Implement search functionality:
- Accept search query parameter
- Pass to service layer
- Handle empty search results

## 📚 Further Reading

- [⚙️ Service Layer Deep Dive](04-service-layer.md)
- [🛡️ Middleware Layer Guide](07-middleware-layer.md)
- [🧪 Testing Controllers](08-testing-fundamentals.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Service Layer →](04-service-layer.md)**

---

*💡 **Tip**: Controllers should be the thinnest layer - if your controller method is more than 20 lines, consider refactoring!*
