# 📚 Layered Architecture - Ilmu Dasar & Pembelajaran

> **Dokumentasi pembelajaran komprehensif untuk memahami setiap layer dalam aplikasi**

## 📋 Daftar Isi

1. [Overview Layered Architecture](#overview-layered-architecture)
2. [Controller Layer - Fundamentals](#controller-layer---fundamentals)
3. [Service Layer - Business Logic](#service-layer---business-logic)
4. [Repository Layer - Data Access](#repository-layer---data-access)
5. [Model Layer - Data Structure](#model-layer---data-structure)
6. [Middleware Layer - Cross-Cutting Concerns](#middleware-layer---cross-cutting-concerns)
7. [Testing Fundamentals](#testing-fundamentals)
8. [Best Practices & Patterns](#best-practices--patterns)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Advanced Concepts](#advanced-concepts)

---

## 🏗️ Overview Layered Architecture

### 🎯 **Apa itu Layered Architecture?**

Layered Architecture adalah pola desain yang membagi aplikasi menjadi beberapa layer dengan tanggung jawab yang berbeda dan terpisah.

```
┌─────────────────────────────────────────────┐
│               Client Layer                  │  ← HTTP Requests
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│            Controller Layer                 │  ← HTTP Handling
│         (Presentation Layer)                │
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│             Service Layer                   │  ← Business Logic
│          (Business Layer)                   │
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│           Repository Layer                  │  ← Data Access
│         (Data Access Layer)                 │
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│             Database Layer                  │  ← Data Storage
└─────────────────────────────────────────────┘
```

### ✅ **Mengapa Layered Architecture?**

**Keuntungan:**
- **Separation of Concerns**: Setiap layer punya tanggung jawab yang jelas
- **Maintainability**: Mudah di-maintain dan di-debug
- **Testability**: Setiap layer bisa di-test secara independen
- **Scalability**: Mudah untuk scale dan modify
- **Reusability**: Layer bisa digunakan ulang

**Kerugian:**
- **Complexity**: Lebih kompleks dari arsitektur sederhana
- **Performance**: Bisa ada overhead karena banyak layer
- **Over-engineering**: Bisa berlebihan untuk aplikasi sederhana

---

## 🎮 Controller Layer - Fundamentals

### 📖 **Definisi & Tanggung Jawab**

Controller adalah **entry point** untuk HTTP requests. Tugasnya:

1. **Menerima HTTP requests**
2. **Validasi input dasar** (parameter, headers)
3. **Memanggil Service layer**
4. **Mengirim HTTP responses**
5. **Handle HTTP-specific concerns**

### 🔧 **Struktur Controller**

```javascript
class RecipeController {
  // Pattern: HTTP Method + Action
  async getAllRecipes(req, res, next) {
    try {
      // 1. Extract parameters (jika ada)
      const { page, limit } = req.query;
      
      // 2. Call service layer
      const result = await recipeService.getAllRecipes({ page, limit });
      
      // 3. Send HTTP response
      res.status(200).json(result);
    } catch (error) {
      // 4. Pass error to error handler
      next(error);
    }
  }
}
```

### 🎯 **Prinsip-Prinsip Controller**

#### 1. **Single Responsibility**
```javascript
// ❌ BAD: Controller melakukan business logic
async createRecipe(req, res, next) {
  try {
    // Validation logic (should be in service/middleware)
    if (!req.body.title || req.body.title.length < 3) {
      return res.status(400).json({ error: 'Title too short' });
    }
    
    // Database operation (should be in repository)
    const recipe = await db.query('INSERT INTO...');
    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

// ✅ GOOD: Controller hanya handle HTTP
async createRecipe(req, res, next) {
  try {
    const result = await recipeService.createRecipe(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

#### 2. **Error Handling**
```javascript
// ✅ GOOD: Consistent error handling
async getRecipeById(req, res, next) {
  try {
    const result = await recipeService.getRecipeById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    // Always pass to error handler middleware
    next(error);
  }
}
```

#### 3. **HTTP Status Codes**
```javascript
// GET - 200 OK
res.status(200).json(data);

// POST - 201 Created
res.status(201).json(newData);

// PUT - 200 OK
res.status(200).json(updatedData);

// DELETE - 200 OK (with body) atau 204 No Content
res.status(200).json(deletedData);
// res.status(204).send(); // No content
```

### 🧪 **Testing Controller**

```javascript
describe('RecipeController', () => {
  test('should return recipes successfully', async () => {
    // Mock service
    recipeService.getAllRecipes = jest.fn().mockResolvedValue({
      success: true,
      data: [{ id: 1, title: 'Test Recipe' }]
    });

    const response = await request(app)
      .get('/api/recipes')
      .expect(200);

    expect(recipeService.getAllRecipes).toHaveBeenCalledTimes(1);
    expect(response.body.success).toBe(true);
  });
});
```

---

## ⚙️ Service Layer - Business Logic

### 📖 **Definisi & Tanggung Jawab**

Service layer adalah **jantung aplikasi** yang berisi business logic. Tugasnya:

1. **Business logic & rules**
2. **Complex validation**
3. **Data transformation**
4. **Koordinasi antar layer**
5. **Transaction management**

### 🔧 **Struktur Service**

```javascript
class RecipeService {
  async createRecipe(recipeData) {
    try {
      // 1. Business validation
      this.validateBusinessRules(recipeData);
      
      // 2. Data transformation
      const cleanData = this.transformData(recipeData);
      
      // 3. Call repository
      const newRecipe = await recipeRepository.create(cleanData);
      
      // 4. Post-processing (jika perlu)
      await this.sendNotification(newRecipe);
      
      // 5. Format response
      return this.formatResponse(newRecipe);
    } catch (error) {
      throw error;
    }
  }
}
```

### 🎯 **Prinsip-Prinsip Service**

#### 1. **Business Logic Centralization**
```javascript
// ✅ GOOD: Business rules terpusat
class RecipeService {
  validateBusinessRules(recipeData) {
    const errors = [];
    
    // Business rule: Premium recipes need approval
    if (recipeData.isPremium && !recipeData.isApproved) {
      errors.push('Premium recipes require approval');
    }
    
    // Business rule: Vegetarian recipes can't have meat
    if (recipeData.isVegetarian && this.containsMeat(recipeData.ingredients)) {
      errors.push('Vegetarian recipes cannot contain meat');
    }
    
    if (errors.length > 0) {
      throw new Error(`Business rule violation: ${errors.join(', ')}`);
    }
  }
  
  containsMeat(ingredients) {
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish'];
    return ingredients.some(ingredient => 
      meatKeywords.some(meat => 
        ingredient.toLowerCase().includes(meat)
      )
    );
  }
}
```

#### 2. **Transaction Management**
```javascript
async updateRecipeWithHistory(id, recipeData) {
  // Start transaction
  const transaction = await db.beginTransaction();
  
  try {
    // 1. Save old version to history
    const oldRecipe = await recipeRepository.findById(id, transaction);
    await historyRepository.create(oldRecipe, transaction);
    
    // 2. Update recipe
    const updatedRecipe = await recipeRepository.update(id, recipeData, transaction);
    
    // 3. Update search index
    await searchService.updateIndex(updatedRecipe, transaction);
    
    // Commit transaction
    await transaction.commit();
    
    return updatedRecipe;
  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    throw error;
  }
}
```

#### 3. **Data Transformation**
```javascript
transformRecipeData(rawData) {
  return {
    title: rawData.title?.trim(),
    description: rawData.description?.trim() || null,
    ingredients: this.normalizeIngredients(rawData.ingredients),
    instructions: this.normalizeInstructions(rawData.instructions),
    difficulty: this.calculateDifficulty(rawData),
    estimatedTime: this.calculateTime(rawData.instructions),
    tags: this.extractTags(rawData)
  };
}
```

### 🧪 **Testing Service**

```javascript
describe('RecipeService', () => {
  beforeEach(() => {
    // Mock dependencies
    jest.clearAllMocks();
  });

  test('should create recipe with business validation', async () => {
    const recipeData = {
      title: 'Test Recipe',
      ingredients: ['flour', 'water'],
      instructions: ['mix', 'bake']
    };

    recipeRepository.create = jest.fn().mockResolvedValue({ id: 1, ...recipeData });

    const result = await recipeService.createRecipe(recipeData);

    expect(result.success).toBe(true);
    expect(recipeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Recipe'
      })
    );
  });

  test('should throw error for invalid business rules', async () => {
    const invalidData = {
      title: 'Vegetarian Chicken',
      isVegetarian: true,
      ingredients: ['chicken', 'vegetables']
    };

    await expect(recipeService.createRecipe(invalidData))
      .rejects
      .toThrow('Business rule violation');
  });
});
```

---

## 🗄️ Repository Layer - Data Access

### 📖 **Definisi & Tanggung Jawab**

Repository layer adalah **abstraksi untuk data access**. Tugasnya:

1. **Database operations (CRUD)**
2. **Query execution**
3. **Data mapping**
4. **Connection management**
5. **Cache management**

### 🔧 **Struktur Repository**

```javascript
class RecipeRepository {
  async findAll(filters = {}) {
    try {
      // 1. Build query
      let query = 'SELECT * FROM recipes';
      const params = [];
      
      // Apply filters
      if (filters.category) {
        query += ' WHERE category = ?';
        params.push(filters.category);
      }
      
      // 2. Execute query
      const [rows] = await db.query(query, params);
      
      // 3. Transform to domain objects
      return rows.map(row => new RecipeModel(this.mapRowToObject(row)));
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}
```

### 🎯 **Prinsip-Prinsip Repository**

#### 1. **Data Abstraction**
```javascript
// ✅ GOOD: Abstract database details
class RecipeRepository {
  async findByDifficulty(difficulty) {
    // Hide SQL complexity from service layer
    const query = `
      SELECT r.*, 
             AVG(rt.rating) as avg_rating,
             COUNT(c.id) as comment_count
      FROM recipes r
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      LEFT JOIN comments c ON r.id = c.recipe_id
      WHERE r.difficulty = ?
      GROUP BY r.id
    `;
    
    const [rows] = await db.query(query, [difficulty]);
    return rows.map(row => new RecipeModel(row));
  }
}
```

#### 2. **Error Handling**
```javascript
async create(recipeData) {
  try {
    const [result] = await db.query(
      'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
      [recipeData.title, recipeData.description, JSON.stringify(recipeData.ingredients), JSON.stringify(recipeData.instructions)]
    );
    
    return this.findById(result.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Recipe with this title already exists');
    }
    if (error.code === 'ER_DATA_TOO_LONG') {
      throw new Error('Recipe data is too long');
    }
    throw new Error(`Database error: ${error.message}`);
  }
}
```

#### 3. **Query Optimization**
```javascript
// Batch operations
async createMany(recipesData) {
  const values = recipesData.map(recipe => [
    recipe.title,
    recipe.description,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.instructions)
  ]);
  
  const placeholders = recipesData.map(() => '(?, ?, ?, ?)').join(', ');
  const query = `INSERT INTO recipes (title, description, ingredients, instructions) VALUES ${placeholders}`;
  
  await db.query(query, values.flat());
}

// Prepared statements for security
async findByTitle(title) {
  // Prevents SQL injection
  const [rows] = await db.query(
    'SELECT * FROM recipes WHERE title LIKE ?',
    [`%${title}%`]
  );
  return rows.map(row => new RecipeModel(row));
}
```

### 🧪 **Testing Repository**

```javascript
describe('RecipeRepository', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    
    // Inject mock database
    recipeRepository.db = mockDb;
  });

  test('should find all recipes', async () => {
    const mockRows = [
      { id: 1, title: 'Recipe 1', ingredients: '["flour"]' },
      { id: 2, title: 'Recipe 2', ingredients: '["sugar"]' }
    ];
    
    mockDb.query.mockResolvedValue([mockRows]);

    const recipes = await recipeRepository.findAll();

    expect(recipes).toHaveLength(2);
    expect(recipes[0]).toBeInstanceOf(RecipeModel);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM recipes ORDER BY created_at DESC');
  });

  test('should handle database errors', async () => {
    mockDb.query.mockRejectedValue(new Error('Connection failed'));

    await expect(recipeRepository.findAll())
      .rejects
      .toThrow('Database error: Connection failed');
  });
});
```

---

## 🏗️ Model Layer - Data Structure

### 📖 **Definisi & Tanggung Jawab**

Model layer mendefinisikan **struktur data dan business rules**. Tugasnya:

1. **Data structure definition**
2. **Data validation**
3. **Data transformation**
4. **Business rules**
5. **Domain logic**

### 🔧 **Struktur Model**

```javascript
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    this.ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
    this.instructions = Array.isArray(data.instructions) ? data.instructions : [];
    this.difficulty = data.difficulty || 'easy';
    this.prepTime = data.prepTime || 0;
    this.cookTime = data.cookTime || 0;
    this.servings = data.servings || 1;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }
}
```

### 🎯 **Prinsip-Prinsip Model**

#### 1. **Data Validation**
```javascript
class RecipeModel {
  validate() {
    const errors = [];
    
    // Required fields
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    // Business rules
    if (this.title && this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (this.title && this.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    // Type validation
    if (!Array.isArray(this.ingredients)) {
      errors.push('Ingredients must be an array');
    }
    
    if (this.ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    }
    
    // Range validation
    if (this.servings < 1 || this.servings > 50) {
      errors.push('Servings must be between 1 and 50');
    }
    
    return errors;
  }
}
```

#### 2. **Data Transformation**
```javascript
class RecipeModel {
  // For client response
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      ingredients: this.ingredients,
      instructions: this.instructions,
      difficulty: this.difficulty,
      totalTime: this.getTotalTime(),
      servings: this.servings,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
  
  // For database storage
  toDatabase() {
    return {
      title: this.title.trim(),
      description: this.description?.trim() || null,
      ingredients: JSON.stringify(this.ingredients),
      instructions: JSON.stringify(this.instructions),
      difficulty: this.difficulty,
      prep_time: this.prepTime,
      cook_time: this.cookTime,
      servings: this.servings
    };
  }
  
  // For search index
  toSearchDocument() {
    return {
      id: this.id,
      title: this.title.toLowerCase(),
      description: this.description?.toLowerCase(),
      ingredients: this.ingredients.join(' ').toLowerCase(),
      tags: this.extractTags(),
      difficulty: this.difficulty
    };
  }
}
```

#### 3. **Business Logic Methods**
```javascript
class RecipeModel {
  getTotalTime() {
    return this.prepTime + this.cookTime;
  }
  
  isQuickRecipe() {
    return this.getTotalTime() <= 30;
  }
  
  isVegetarian() {
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'meat'];
    return !this.ingredients.some(ingredient =>
      meatKeywords.some(meat =>
        ingredient.toLowerCase().includes(meat)
      )
    );
  }
  
  getDifficultyLevel() {
    const levels = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };
    return levels[this.difficulty] || 1;
  }
  
  extractTags() {
    const tags = [];
    
    if (this.isVegetarian()) tags.push('vegetarian');
    if (this.isQuickRecipe()) tags.push('quick');
    if (this.getDifficultyLevel() === 1) tags.push('beginner-friendly');
    
    return tags;
  }
}
```

### 🧪 **Testing Model**

```javascript
describe('RecipeModel', () => {
  test('should create model with default values', () => {
    const recipe = new RecipeModel();
    
    expect(recipe.id).toBeNull();
    expect(recipe.title).toBe('');
    expect(recipe.ingredients).toEqual([]);
    expect(recipe.difficulty).toBe('easy');
    expect(recipe.servings).toBe(1);
  });

  test('should validate required fields', () => {
    const recipe = new RecipeModel({ title: '' });
    const errors = recipe.validate();
    
    expect(errors).toContain('Title is required');
  });

  test('should calculate total time correctly', () => {
    const recipe = new RecipeModel({
      prepTime: 15,
      cookTime: 30
    });
    
    expect(recipe.getTotalTime()).toBe(45);
    expect(recipe.isQuickRecipe()).toBe(false);
  });

  test('should detect vegetarian recipes', () => {
    const vegetarianRecipe = new RecipeModel({
      ingredients: ['tomato', 'onion', 'garlic']
    });
    
    const nonVegetarianRecipe = new RecipeModel({
      ingredients: ['chicken breast', 'vegetables']
    });
    
    expect(vegetarianRecipe.isVegetarian()).toBe(true);
    expect(nonVegetarianRecipe.isVegetarian()).toBe(false);
  });
});
```

---

## 🛡️ Middleware Layer - Cross-Cutting Concerns

### 📖 **Definisi & Tanggung Jawab**

Middleware menangani **cross-cutting concerns** yang berlaku untuk banyak endpoint:

1. **Authentication & Authorization**
2. **Logging & Monitoring**
3. **Validation**
4. **Error Handling**
5. **Rate Limiting**
6. **CORS**

### 🔧 **Types of Middleware**

#### 1. **Application-Level Middleware**
```javascript
// Logger middleware
const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  
  // Log request body for POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, data);
  };
  
  next();
};
```

#### 2. **Error Handling Middleware**
```javascript
const errorHandler = (err, req, res, next) => {
  // Log error (not in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error occurred:', err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle different error types
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Validation')) {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
};
```

#### 3. **Validation Middleware**
```javascript
const validateRecipe = (req, res, next) => {
  const errors = [];
  const { title, ingredients, instructions } = req.body;

  // Validate required fields
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push('Ingredients are required and must be an array');
  }

  if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
    errors.push('Instructions are required and must be an array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};
```

#### 4. **Authentication Middleware**
```javascript
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
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
```

### 🧪 **Testing Middleware**

```javascript
describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should pass validation with valid data', () => {
    req.body = {
      title: 'Test Recipe',
      ingredients: ['ingredient1'],
      instructions: ['step1']
    };

    validateRecipe(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should fail validation with missing title', () => {
    req.body = {
      ingredients: ['ingredient1'],
      instructions: ['step1']
    };

    validateRecipe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining(['Title is required'])
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

## 🧪 Testing Fundamentals

### 📖 **Types of Testing**

#### 1. **Unit Testing**
Test individual components in isolation:

```javascript
// Test Model
describe('RecipeModel', () => {
  test('should validate required fields', () => {
    const recipe = new RecipeModel({ title: '' });
    const errors = recipe.validate();
    expect(errors).toContain('Title is required');
  });
});

// Test Service (with mocked dependencies)
describe('RecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create recipe successfully', async () => {
    recipeRepository.create = jest.fn().mockResolvedValue({ id: 1 });
    
    const result = await recipeService.createRecipe(validRecipeData);
    
    expect(result.success).toBe(true);
    expect(recipeRepository.create).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. **Integration Testing**
Test multiple components working together:

```javascript
describe('Recipe API Integration', () => {
  test('should create and retrieve recipe', async () => {
    // Create recipe
    const createResponse = await request(app)
      .post('/api/recipes')
      .send({
        title: 'Integration Test Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      })
      .expect(201);

    const recipeId = createResponse.body.data.id;

    // Retrieve recipe
    const getResponse = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .expect(200);

    expect(getResponse.body.data.title).toBe('Integration Test Recipe');
  });
});
```

#### 3. **End-to-End Testing**
Test complete user workflows:

```javascript
describe('Recipe Workflow E2E', () => {
  test('complete recipe management workflow', async () => {
    // 1. Create recipe
    const createResponse = await request(app)
      .post('/api/recipes')
      .send(recipeData)
      .expect(201);

    const recipeId = createResponse.body.data.id;

    // 2. Get all recipes (should include new recipe)
    const getAllResponse = await request(app)
      .get('/api/recipes')
      .expect(200);

    expect(getAllResponse.body.data).toHaveLength(1);

    // 3. Update recipe
    const updateResponse = await request(app)
      .put(`/api/recipes/${recipeId}`)
      .send(updatedRecipeData)
      .expect(200);

    expect(updateResponse.body.data.title).toBe(updatedRecipeData.title);

    // 4. Delete recipe
    await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .expect(200);

    // 5. Verify deletion
    await request(app)
      .get(`/api/recipes/${recipeId}`)
      .expect(404);
  });
});
```

### 🎯 **Testing Best Practices**

#### 1. **AAA Pattern (Arrange, Act, Assert)**
```javascript
test('should calculate total time correctly', () => {
  // Arrange
  const recipe = new RecipeModel({
    prepTime: 15,
    cookTime: 30
  });

  // Act
  const totalTime = recipe.getTotalTime();

  // Assert
  expect(totalTime).toBe(45);
});
```

#### 2. **Mocking Dependencies**
```javascript
describe('RecipeService', () => {
  beforeEach(() => {
    // Mock external dependencies
    recipeRepository.create = jest.fn();
    emailService.sendNotification = jest.fn();
    cacheService.invalidate = jest.fn();
  });

  test('should handle repository errors', async () => {
    recipeRepository.create.mockRejectedValue(new Error('DB Error'));

    await expect(recipeService.createRecipe(validData))
      .rejects
      .toThrow('DB Error');
  });
});
```

#### 3. **Test Data Management**
```javascript
// Test data factory
const createTestRecipe = (overrides = {}) => ({
  title: 'Test Recipe',
  description: 'Test description',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  difficulty: 'easy',
  servings: 4,
  ...overrides
});

// Usage
test('should validate recipe title length', () => {
  const longTitleRecipe = createTestRecipe({
    title: 'x'.repeat(101) // Over 100 characters
  });

  const recipe = new RecipeModel(longTitleRecipe);
  const errors = recipe.validate();

  expect(errors).toContain('Title must be less than 100 characters');
});
```

---

## ✅ Best Practices & Patterns

### 🎯 **General Principles**

#### 1. **SOLID Principles**

**Single Responsibility Principle (SRP)**
```javascript
// ❌ BAD: Class does too many things
class RecipeManager {
  async createRecipe(data) { /* database operations */ }
  async validateRecipe(data) { /* validation logic */ }
  async sendEmail(recipe) { /* email sending */ }
  async generatePDF(recipe) { /* PDF generation */ }
}

// ✅ GOOD: Separate responsibilities
class RecipeService {
  async createRecipe(data) {
    const validation = new RecipeValidator();
    const repository = new RecipeRepository();
    const notifier = new NotificationService();
    
    validation.validate(data);
    const recipe = await repository.create(data);
    await notifier.notify(recipe);
    
    return recipe;
  }
}
```

**Dependency Inversion Principle (DIP)**
```javascript
// ✅ GOOD: Depend on abstractions
class RecipeService {
  constructor(repository, validator, notifier) {
    this.repository = repository;    // Interface
    this.validator = validator;      // Interface
    this.notifier = notifier;        // Interface
  }
}

// Concrete implementations
const recipeService = new RecipeService(
  new MySQLRecipeRepository(),
  new JSONSchemaValidator(),
  new EmailNotifier()
);
```

#### 2. **Error Handling Patterns**

**Result Pattern**
```javascript
class Result {
  constructor(success, data, error) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new Result(true, data, null);
  }

  static failure(error) {
    return new Result(false, null, error);
  }
}

// Usage
async createRecipe(recipeData) {
  try {
    const recipe = await this.repository.create(recipeData);
    return Result.success(recipe);
  } catch (error) {
    return Result.failure(error.message);
  }
}
```

**Custom Error Classes**
```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Usage
async getRecipeById(id) {
  const recipe = await this.repository.findById(id);
  if (!recipe) {
    throw new NotFoundError('Recipe', id);
  }
  return recipe;
}
```

#### 3. **Async/Await Best Practices**

```javascript
// ✅ GOOD: Proper error handling
async createRecipeWithIngredients(recipeData, ingredientIds) {
  try {
    // Parallel operations when possible
    const [ingredients, existingRecipe] = await Promise.all([
      this.ingredientService.getByIds(ingredientIds),
      this.repository.findByTitle(recipeData.title)
    ]);

    if (existingRecipe) {
      throw new Error('Recipe already exists');
    }

    // Sequential operations when needed
    const recipe = await this.repository.create(recipeData);
    await this.linkIngredients(recipe.id, ingredients);
    
    return recipe;
  } catch (error) {
    throw error;
  }
}
```

---

## ⚠️ Common Pitfalls & Solutions

### 🚨 **Anti-Patterns to Avoid**

#### 1. **God Objects**
```javascript
// ❌ BAD: One class does everything
class RecipeManager {
  async createRecipe() { /* ... */ }
  async updateRecipe() { /* ... */ }
  async deleteRecipe() { /* ... */ }
  async validateRecipe() { /* ... */ }
  async sendEmail() { /* ... */ }
  async generateReport() { /* ... */ }
  async connectToDatabase() { /* ... */ }
  async handlePayment() { /* ... */ }
}

// ✅ GOOD: Split responsibilities
class RecipeService { /* business logic */ }
class RecipeRepository { /* data access */ }
class RecipeValidator { /* validation */ }
class NotificationService { /* notifications */ }
```

#### 2. **Tight Coupling**
```javascript
// ❌ BAD: Tightly coupled
class RecipeService {
  async createRecipe(data) {
    // Direct dependency on concrete class
    const db = new MySQLDatabase();
    const mailer = new SMTPMailer();
    
    const recipe = await db.insert('recipes', data);
    await mailer.send('admin@example.com', 'New recipe created');
    
    return recipe;
  }
}

// ✅ GOOD: Loose coupling with dependency injection
class RecipeService {
  constructor(repository, mailer) {
    this.repository = repository;
    this.mailer = mailer;
  }

  async createRecipe(data) {
    const recipe = await this.repository.create(data);
    await this.mailer.notifyAdmin('New recipe created', recipe);
    return recipe;
  }
}
```

#### 3. **Business Logic in Wrong Layer**
```javascript
// ❌ BAD: Business logic in controller
class RecipeController {
  async createRecipe(req, res) {
    // Business validation (should be in service)
    if (req.body.difficulty === 'hard' && req.user.experience < 5) {
      return res.status(403).json({ error: 'Not experienced enough' });
    }

    // Database operation (should be in repository)
    const recipe = await db.query('INSERT INTO recipes...');
    
    res.json(recipe);
  }
}

// ✅ GOOD: Business logic in service
class RecipeService {
  async createRecipe(recipeData, user) {
    // Business validation
    if (recipeData.difficulty === 'hard' && user.experience < 5) {
      throw new Error('User not experienced enough for hard recipes');
    }

    return await this.repository.create(recipeData);
  }
}
```

### 🔧 **Performance Considerations**

#### 1. **N+1 Query Problem**
```javascript
// ❌ BAD: N+1 queries
async getRecipesWithAuthors() {
  const recipes = await this.repository.findAll(); // 1 query
  
  for (const recipe of recipes) {
    recipe.author = await this.userRepository.findById(recipe.authorId); // N queries
  }
  
  return recipes;
}

// ✅ GOOD: Single query with joins
async getRecipesWithAuthors() {
  return await this.repository.findAllWithAuthors(); // 1 query with JOIN
}
```

#### 2. **Memory Management**
```javascript
// ✅ GOOD: Stream large datasets
async exportAllRecipes(res) {
  const stream = this.repository.streamAll();
  
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  
  let first = true;
  stream.on('data', (recipe) => {
    if (!first) res.write(',');
    res.write(JSON.stringify(recipe));
    first = false;
  });
  
  stream.on('end', () => {
    res.write(']');
    res.end();
  });
}
```

---

## 🚀 Advanced Concepts

### 🎯 **Design Patterns**

#### 1. **Repository Pattern**
```javascript
// Abstract repository
class BaseRepository {
  async findById(id) {
    throw new Error('Method must be implemented');
  }
  
  async findAll(filters = {}) {
    throw new Error('Method must be implemented');
  }
  
  async create(data) {
    throw new Error('Method must be implemented');
  }
}

// Concrete implementation
class MySQLRecipeRepository extends BaseRepository {
  async findById(id) {
    const [rows] = await this.db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    return rows[0] ? new RecipeModel(rows[0]) : null;
  }
}

// Alternative implementation
class MongoRecipeRepository extends BaseRepository {
  async findById(id) {
    const document = await this.collection.findById(id);
    return document ? new RecipeModel(document) : null;
  }
}
```

#### 2. **Factory Pattern**
```javascript
class ServiceFactory {
  static createRecipeService(dbType = 'mysql') {
    let repository;
    
    switch (dbType) {
      case 'mysql':
        repository = new MySQLRecipeRepository();
        break;
      case 'mongodb':
        repository = new MongoRecipeRepository();
        break;
      default:
        throw new Error('Unsupported database type');
    }
    
    return new RecipeService(repository);
  }
}

// Usage
const recipeService = ServiceFactory.createRecipeService(process.env.DB_TYPE);
```

#### 3. **Observer Pattern**
```javascript
class RecipeService extends EventEmitter {
  async createRecipe(recipeData) {
    const recipe = await this.repository.create(recipeData);
    
    // Emit events for other services to listen
    this.emit('recipe:created', { recipe, user: recipeData.createdBy });
    
    return recipe;
  }
}

// Event listeners
recipeService.on('recipe:created', async ({ recipe, user }) => {
  await emailService.sendConfirmation(user, recipe);
  await searchService.indexRecipe(recipe);
  await analyticsService.trackCreation(recipe);
});
```

### 🔄 **Caching Strategies**

```javascript
class CachedRecipeService {
  constructor(recipeService, cache) {
    this.recipeService = recipeService;
    this.cache = cache;
  }

  async getRecipeById(id) {
    const cacheKey = `recipe:${id}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fallback to service
    const recipe = await this.recipeService.getRecipeById(id);
    
    // Cache the result
    await this.cache.set(cacheKey, JSON.stringify(recipe), { ttl: 300 }); // 5 minutes
    
    return recipe;
  }
}
```

### 🔒 **Security Best Practices**

```javascript
// Input sanitization
class RecipeService {
  async createRecipe(recipeData) {
    // Sanitize HTML content
    const sanitizedData = {
      ...recipeData,
      title: validator.escape(recipeData.title),
      description: recipeData.description ? sanitizeHtml(recipeData.description) : null
    };
    
    return await this.repository.create(sanitizedData);
  }
}

// Rate limiting
const createRecipeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 recipes per window
  message: 'Too many recipes created, please try again later'
});

app.post('/api/recipes', createRecipeRateLimit, recipeController.createRecipe);
```

---

## 🎓 Kesimpulan

### 📚 **Key Takeaways**

1. **Layered Architecture** memberikan struktur yang jelas dan maintainable
2. **Separation of Concerns** adalah prinsip fundamental yang harus diterapkan
3. **Testing** di setiap layer memastikan kode yang robust
4. **Error Handling** yang konsisten meningkatkan user experience
5. **Best Practices** membantu menghindari common pitfalls

### 🚀 **Next Steps untuk Pembelajaran**

1. **Praktik**: Implementasikan patterns yang dipelajari
2. **Eksperimen**: Coba different architectural approaches
3. **Review**: Analisis kode existing untuk improvement opportunities
4. **Contribute**: Share knowledge dengan tim dan community

---

> **"Good architecture is not about perfection, it's about making the right trade-offs for your specific context."**

💡 **Happy Learning & Coding!** 🚀
