# 📚 Panduan Belajar Layered Architecture - Pemula

> **Dokumentasi pembelajaran step-by-step untuk memahami setiap layer dari dasar**

## 🎯 Tujuan Pembelajaran

Setelah mempelajari dokumentasi ini, Anda akan memahami:
- Konsep dasar setiap layer dalam aplikasi
- Cara kerja komunikasi antar layer
- Implementasi praktis setiap layer
- Testing strategy untuk setiap layer

---

## 📋 Roadmap Pembelajaran

```
1. 📖 Konsep Dasar (30 menit)
   ├── Apa itu Layered Architecture?
   ├── Mengapa menggunakan Layered Architecture?
   └── Overview setiap layer

2. 🏗️ Layer by Layer (2 jam)
   ├── Model Layer - Data Structure
   ├── Repository Layer - Data Access
   ├── Service Layer - Business Logic
   ├── Controller Layer - HTTP Handling
   └── Middleware Layer - Cross-cutting Concerns

3. 🧪 Testing Strategy (1 jam)
   ├── Unit Testing per Layer
   ├── Integration Testing
   └── Best Practices

4. 🚀 Praktik Langsung (1 jam)
   ├── Implementasi CRUD
   ├── Error Handling
   └── Validasi Data
```

---

## 🏗️ PART 1: Konsep Dasar

### 🤔 Apa itu Layered Architecture?

Bayangkan Anda membangun sebuah rumah:
- **Foundation** (Database): Pondasi yang menyimpan data
- **Structure** (Repository): Kerangka yang mengakses data
- **Rooms** (Service): Ruangan dengan fungsi bisnis tertentu
- **Interface** (Controller): Pintu masuk untuk tamu (user)
- **Security** (Middleware): Sistem keamanan di setiap pintu

### 📊 Flow Data dalam Aplikasi

```
User Request (HTTP)
       ↓
1. Middleware ← (CORS, Validation, Logging)
       ↓
2. Controller ← (HTTP Request/Response handling)
       ↓
3. Service ← (Business Logic, Rules)
       ↓
4. Repository ← (Database Operations)
       ↓
5. Model ← (Data Structure, Validation)
       ↓
   Database
```

### 🎯 Mengapa Menggunakan Layered Architecture?

#### ✅ **Keuntungan:**
- **Separation of Concerns**: Setiap layer punya tanggung jawab sendiri
- **Maintainability**: Mudah dipelihara dan diubah
- **Testability**: Mudah ditest secara terpisah
- **Reusability**: Code bisa dipakai ulang
- **Scalability**: Mudah dikembangkan

#### ❌ **Kerugian:**
- **Complexity**: Lebih kompleks untuk aplikasi sederhana
- **Performance**: Ada overhead karena multiple layers
- **Learning Curve**: Butuh waktu untuk dipelajari

---

## 🏗️ PART 2: Layer by Layer

## 📦 Layer 1: Model Layer

### 🎯 **Apa itu Model?**
Model adalah representasi struktur data dan aturan bisnis dasar.

### 📝 **Tanggung Jawab Model:**
- Mendefinisikan struktur data
- Validasi data
- Transformasi data
- Business rules sederhana

### 🔍 **Contoh Implementasi:**

```javascript
// src/models/recipeModel.js
class RecipeModel {
  constructor(data) {
    this.id = data.id || null;
    this.title = data.title;
    this.ingredients = data.ingredients;
    this.instructions = data.instructions;
    this.cooking_time = data.cooking_time;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validasi data
  static validate(data) {
    const errors = [];
    
    if (!data.title || data.title.length < 3) {
      errors.push('Title harus minimal 3 karakter');
    }
    
    if (!data.ingredients) {
      errors.push('Ingredients wajib diisi');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Transform ke JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      ingredients: this.ingredients,
      instructions: this.instructions,
      cooking_time: this.cooking_time,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
```

### 🧪 **Testing Model:**

```javascript
// tests/unit/recipeModel.test.js
describe('RecipeModel', () => {
  test('should create valid recipe', () => {
    const data = {
      title: 'Nasi Goreng',
      ingredients: 'Nasi, Telur, Kecap',
      instructions: 'Tumis semua bahan'
    };
    
    const recipe = new RecipeModel(data);
    expect(recipe.title).toBe('Nasi Goreng');
  });

  test('should validate required fields', () => {
    const result = RecipeModel.validate({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title harus minimal 3 karakter');
  });
});
```

---

## 📚 Layer 2: Repository Layer

### 🎯 **Apa itu Repository?**
Repository adalah layer yang bertanggung jawab untuk mengakses dan mengelola data.

### 📝 **Tanggung Jawab Repository:**
- CRUD operations (Create, Read, Update, Delete)
- Query database
- Data mapping
- Transaction handling

### 🔍 **Contoh Implementasi:**

```javascript
// src/repositories/recipeRepository.js
class RecipeRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    try {
      const [rows] = await this.db.execute('SELECT * FROM recipes');
      return rows.map(row => new RecipeModel(row));
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM recipes WHERE id = ?', 
        [id]
      );
      
      if (rows.length === 0) return null;
      return new RecipeModel(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async create(recipeData) {
    const validation = RecipeModel.validate(recipeData);
    if (!validation.isValid) {
      throw new Error(`Validation error: ${validation.errors.join(', ')}`);
    }

    try {
      const recipe = new RecipeModel(recipeData);
      const [result] = await this.db.execute(
        'INSERT INTO recipes (title, ingredients, instructions, cooking_time) VALUES (?, ?, ?, ?)',
        [recipe.title, recipe.ingredients, recipe.instructions, recipe.cooking_time]
      );
      
      recipe.id = result.insertId;
      return recipe;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}
```

### 🧪 **Testing Repository:**

```javascript
// tests/unit/recipeRepository.test.js
describe('RecipeRepository', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn()
    };
    repository = new RecipeRepository(mockDb);
  });

  test('should find all recipes', async () => {
    const mockRows = [
      { id: 1, title: 'Recipe 1', ingredients: 'Ingredient 1' }
    ];
    mockDb.execute.mockResolvedValue([mockRows]);

    const recipes = await repository.findAll();
    
    expect(recipes).toHaveLength(1);
    expect(recipes[0]).toBeInstanceOf(RecipeModel);
  });

  test('should create new recipe', async () => {
    const recipeData = {
      title: 'New Recipe',
      ingredients: 'New Ingredients',
      instructions: 'New Instructions'
    };
    
    mockDb.execute.mockResolvedValue([{ insertId: 1 }]);

    const recipe = await repository.create(recipeData);
    
    expect(recipe.id).toBe(1);
    expect(recipe.title).toBe('New Recipe');
  });
});
```

---

## ⚙️ Layer 3: Service Layer

### 🎯 **Apa itu Service?**
Service adalah layer yang mengatur business logic dan orchestration.

### 📝 **Tanggung Jawab Service:**
- Business logic dan rules
- Koordinasi antar repository
- Data transformation
- Error handling
- Caching logic

### 🔍 **Contoh Implementasi:**

```javascript
// src/services/recipeService.js
class RecipeService {
  constructor(recipeRepository) {
    this.recipeRepository = recipeRepository;
  }

  async getAllRecipes() {
    try {
      const recipes = await this.recipeRepository.findAll();
      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  async getRecipeById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid recipe ID');
    }

    try {
      const recipe = await this.recipeRepository.findById(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      return recipe.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async createRecipe(recipeData) {
    // Business rule: Title harus unik
    const existingRecipes = await this.recipeRepository.findAll();
    const duplicateTitle = existingRecipes.find(
      recipe => recipe.title.toLowerCase() === recipeData.title.toLowerCase()
    );
    
    if (duplicateTitle) {
      throw new Error('Recipe with this title already exists');
    }

    try {
      const recipe = await this.recipeRepository.create(recipeData);
      return recipe.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async updateRecipe(id, updateData) {
    const existingRecipe = await this.getRecipeById(id);
    
    const updatedData = {
      ...existingRecipe,
      ...updateData,
      updated_at: new Date()
    };

    try {
      const recipe = await this.recipeRepository.update(id, updatedData);
      return recipe.toJSON();
    } catch (error) {
      throw error;
    }
  }
}
```

### 🧪 **Testing Service:**

```javascript
// tests/unit/recipeService.test.js
describe('RecipeService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    service = new RecipeService(mockRepository);
  });

  test('should get all recipes', async () => {
    const mockRecipes = [
      new RecipeModel({ id: 1, title: 'Recipe 1' })
    ];
    mockRepository.findAll.mockResolvedValue(mockRecipes);

    const recipes = await service.getAllRecipes();
    
    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('Recipe 1');
  });

  test('should throw error for invalid ID', async () => {
    await expect(service.getRecipeById('invalid')).rejects.toThrow('Invalid recipe ID');
  });

  test('should prevent duplicate titles', async () => {
    const existingRecipes = [
      new RecipeModel({ title: 'Existing Recipe' })
    ];
    mockRepository.findAll.mockResolvedValue(existingRecipes);

    const newRecipeData = { title: 'existing recipe' }; // case insensitive

    await expect(service.createRecipe(newRecipeData))
      .rejects.toThrow('Recipe with this title already exists');
  });
});
```

---

## 🌐 Layer 4: Controller Layer

### 🎯 **Apa itu Controller?**
Controller adalah layer yang menangani HTTP request dan response.

### 📝 **Tanggung Jawab Controller:**
- Handle HTTP requests
- Parse request data
- Call appropriate service methods
- Format response
- Handle HTTP status codes

### 🔍 **Contoh Implementasi:**

```javascript
// src/controllers/recipeController.js
class RecipeController {
  constructor(recipeService) {
    this.recipeService = recipeService;
  }

  async getAllRecipes(req, res, next) {
    try {
      const recipes = await this.recipeService.getAllRecipes();
      res.status(200).json({
        success: true,
        data: recipes,
        message: 'Recipes retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      const recipe = await this.recipeService.getRecipeById(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: recipe,
        message: 'Recipe retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async createRecipe(req, res, next) {
    try {
      const recipeData = req.body;
      const recipe = await this.recipeService.createRecipe(recipeData);
      
      res.status(201).json({
        success: true,
        data: recipe,
        message: 'Recipe created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRecipe(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const recipe = await this.recipeService.updateRecipe(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        data: recipe,
        message: 'Recipe updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 🧪 **Testing Controller:**

```javascript
// tests/unit/recipeController.test.js
describe('RecipeController', () => {
  let controller;
  let mockService;
  let req, res, next;

  beforeEach(() => {
    mockService = {
      getAllRecipes: jest.fn(),
      getRecipeById: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn()
    };
    
    controller = new RecipeController(mockService);
    
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should get all recipes', async () => {
    const mockRecipes = [{ id: 1, title: 'Recipe 1' }];
    mockService.getAllRecipes.mockResolvedValue(mockRecipes);

    await controller.getAllRecipes(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockRecipes,
      message: 'Recipes retrieved successfully'
    });
  });

  test('should handle errors', async () => {
    const error = new Error('Service error');
    mockService.getAllRecipes.mockRejectedValue(error);

    await controller.getAllRecipes(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
```

---

## 🛡️ Layer 5: Middleware Layer

### 🎯 **Apa itu Middleware?**
Middleware adalah fungsi yang dijalankan sebelum atau sesudah request/response cycle.

### 📝 **Tanggung Jawab Middleware:**
- Authentication & Authorization
- Logging
- CORS handling
- Error handling
- Request validation
- Rate limiting

### 🔍 **Contoh Implementasi Error Handler:**

```javascript
// src/middleware/errorHandler.js
const errorHandler = (error, req, res, next) => {
  let status = 500;
  let message = 'Internal Server Error';

  // Parse JSON errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    status = 400;
    message = 'Invalid JSON format';
  }
  
  // Validation errors
  else if (error.message.includes('Validation error')) {
    status = 400;
    message = error.message;
  }
  
  // Not found errors
  else if (error.message.includes('not found')) {
    status = 404;
    message = error.message;
  }
  
  // Database errors
  else if (error.message.includes('Database error')) {
    status = 500;
    message = 'Database operation failed';
  }

  // Log error (except in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`Error ${status}: ${message}`, error.stack);
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;
```

### 🧪 **Testing Middleware:**

```javascript
// tests/unit/errorHandler.test.js
describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should handle validation errors', () => {
    const error = new Error('Validation error: Title is required');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation error: Title is required'
    });
  });

  test('should handle not found errors', () => {
    const error = new Error('Recipe not found');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Recipe not found'
    });
  });
});
```

---

## 🧪 PART 3: Testing Strategy

### 🎯 **Testing Pyramid untuk Layered Architecture**

```
      E2E Tests (5%)
     ├── Full workflow tests
     └── User journey tests
    
  Integration Tests (25%)
 ├── Controller + Service + Repository
 ├── API endpoints with middleware
 └── Database integration
    
Unit Tests (70%)
├── Model validation & transformation
├── Repository database operations  
├── Service business logic
├── Controller HTTP handling
└── Middleware functions
```

### 📝 **Testing Checklist per Layer:**

#### **✅ Model Testing:**
- [ ] Data validation
- [ ] Data transformation  
- [ ] toJSON() methods
- [ ] Static methods
- [ ] Edge cases

#### **✅ Repository Testing:**
- [ ] CRUD operations
- [ ] Database queries
- [ ] Error handling
- [ ] Data mapping
- [ ] Mock database responses

#### **✅ Service Testing:**
- [ ] Business logic
- [ ] Multiple repository calls
- [ ] Error propagation
- [ ] Data transformation
- [ ] Business rules validation

#### **✅ Controller Testing:**
- [ ] HTTP request handling
- [ ] Response formatting
- [ ] Status codes
- [ ] Error handling
- [ ] Parameter validation

#### **✅ Middleware Testing:**
- [ ] Request processing
- [ ] Error handling
- [ ] Authentication logic
- [ ] CORS headers
- [ ] Logging functionality

### 🔧 **Test Setup Example:**

```javascript
// tests/setup.js
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_pass';
process.env.DB_NAME = 'test_recipes';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in test environment
global.console = {
  ...console,
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
  error: process.env.NODE_ENV === 'test' ? jest.fn() : console.error,
  warn: process.env.NODE_ENV === 'test' ? jest.fn() : console.warn,
};
```

### 📊 **Integration Test Example:**

```javascript
// tests/integration/api.test.js
describe('Recipe API Integration', () => {
  let app;
  let server;

  beforeAll(async () => {
    app = require('../../src/app');
    server = app.listen(0); // Random port
  });

  afterAll(async () => {
    await server.close();
  });

  test('should create and retrieve recipe', async () => {
    const newRecipe = {
      title: 'Integration Test Recipe',
      ingredients: 'Test ingredients',
      instructions: 'Test instructions'
    };

    // Create recipe
    const createResponse = await request(app)
      .post('/api/recipes')
      .send(newRecipe)
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.title).toBe(newRecipe.title);

    const recipeId = createResponse.body.data.id;

    // Get recipe
    const getResponse = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.id).toBe(recipeId);
  });
});
```

---

## 🚀 PART 4: Praktik Langsung

### 🎯 **Exercise 1: Implementasi Fitur Baru**

**Task:** Tambahkan fitur rating untuk recipe

1. **Model Layer:**
   ```javascript
   // Tambahkan field rating di RecipeModel
   constructor(data) {
     // ...existing fields
     this.rating = data.rating || 0;
   }

   static validate(data) {
     // ...existing validation
     if (data.rating && (data.rating < 1 || data.rating > 5)) {
       errors.push('Rating harus antara 1-5');
     }
   }
   ```

2. **Repository Layer:**
   ```javascript
   // Update query untuk include rating
   async findAll() {
     const [rows] = await this.db.execute(
       'SELECT *, AVG(rating) as avg_rating FROM recipes GROUP BY id'
     );
   }
   ```

3. **Service Layer:**
   ```javascript
   // Business rule: Rating calculation
   async updateRating(recipeId, newRating) {
     // Validate rating
     // Calculate average
     // Update recipe
   }
   ```

4. **Controller Layer:**
   ```javascript
   // New endpoint
   async updateRating(req, res, next) {
     const { id } = req.params;
     const { rating } = req.body;
     // Handle rating update
   }
   ```

### 🧪 **Exercise 2: Write Tests**

Tulis test untuk setiap layer yang sudah diimplementasi:

```javascript
// Model test
test('should validate rating range', () => {
  const result = RecipeModel.validate({ rating: 6 });
  expect(result.errors).toContain('Rating harus antara 1-5');
});

// Service test
test('should calculate average rating correctly', async () => {
  // Mock multiple ratings
  // Test average calculation
});

// Controller test
test('should update recipe rating', async () => {
  // Test rating endpoint
});
```

---

## 📚 Resources & Next Steps

### 📖 **Dokumentasi Lanjutan:**
- [`layered-architecture-fundamentals.md`](./layered-architecture-fundamentals.md) - Konsep advanced
- [`testing-guide-comprehensive.md`](./testing-guide-comprehensive.md) - Testing mendalam
- [`repository-model-relationship.md`](./repository-model-relationship.md) - Hubungan Repository-Model

### 🔗 **Best Practices:**
- Selalu validasi data di Model layer
- Implement proper error handling di setiap layer
- Write tests untuk setiap method
- Use dependency injection untuk loose coupling
- Follow SOLID principles

### 🎯 **Challenge Selanjutnya:**
1. Implementasi authentication middleware
2. Add caching layer di Service
3. Implement database transactions
4. Add API rate limiting
5. Create comprehensive E2E tests

---

## 💡 Tips & Tricks

### ⚡ **Development Tips:**
- Start dengan Model layer terlebih dahulu
- Test setiap layer secara terpisah
- Use mock objects untuk testing
- Keep business logic di Service layer
- Handle errors gracefully di setiap layer

### 🐛 **Common Mistakes:**
- Putting business logic di Controller
- Not validating data di Model
- Tight coupling antar layer
- Not handling errors properly
- Skipping unit tests

### 🚀 **Performance Tips:**
- Use connection pooling untuk database
- Implement caching strategy
- Optimize database queries
- Use async/await properly
- Monitor memory usage

---

*Happy Learning! 🎉*

> **Catatan:** Dokumentasi ini adalah starting point. Untuk pembelajaran yang lebih mendalam, lanjutkan ke dokumentasi advanced yang tersedia di folder `docs/`.
