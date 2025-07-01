# 🧪 Testing Guide - Pembelajaran Dasar

> **Panduan step-by-step untuk memahami testing dari dasar sampai mahir**

## 🎯 Tujuan Pembelajaran

Setelah mempelajari guide ini, Anda akan mampu:
- Memahami konsep dasar testing
- Menulis unit test untuk setiap layer
- Membuat integration test
- Menggunakan mocking dengan benar
- Menganalisis test coverage

---

## 📋 Roadmap Testing

```
1. 🧠 Konsep Dasar (45 menit)
   ├── Apa itu testing?
   ├── Jenis-jenis testing
   ├── Testing pyramid
   └── Arrange-Act-Assert pattern

2. 🔧 Setup & Tools (30 menit)
   ├── Jest configuration
   ├── Test environment
   ├── Mock & Spy
   └── Test helpers

3. 📝 Unit Testing (90 menit)
   ├── Testing Model layer
   ├── Testing Repository layer
   ├── Testing Service layer
   └── Testing Controller layer

4. 🔗 Integration Testing (60 menit)
   ├── API endpoint testing
   ├── Database integration
   └── Middleware testing

5. 📊 Coverage & Best Practices (30 menit)
   ├── Coverage analysis
   ├── Test maintenance
   └── Common pitfalls
```

---

## 🧠 PART 1: Konsep Dasar Testing

### 🤔 Apa itu Testing?

Testing adalah proses memverifikasi bahwa kode kita berfungsi sesuai dengan yang diharapkan.

**Analogi sederhana:**
- Seperti test driving mobil sebelum dibeli
- Seperti mencicipi masakan sebelum disajikan
- Seperti mengecek kalkulator dengan hitungan manual

### 📊 Jenis-jenis Testing

```
🏗️ Testing Pyramid

        /\
       /E2E\ (5-10%)
      /    \ End-to-End
     /______\ Full workflow
    /        \
   /   INTEG  \ (20-30%)
  /           \ Component integration
 /    UNIT     \ (60-70%)
/_______________\ Individual functions
```

#### **1. Unit Testing** 🔬
- **Apa:** Test komponen individual (function, class, method)
- **Kapan:** Setiap kali menulis function baru
- **Contoh:** Test validasi email, test calculation function

#### **2. Integration Testing** 🔗  
- **Apa:** Test interaksi antar komponen
- **Kapan:** Setelah unit test selesai
- **Contoh:** Test API endpoint, test database connection

#### **3. End-to-End Testing** 🚀
- **Apa:** Test complete user workflow
- **Kapan:** Sebelum deployment
- **Contoh:** Test login → browse → checkout process

### 🎯 AAA Pattern (Arrange-Act-Assert)

Setiap test mengikuti pattern ini:

```javascript
test('should calculate total price correctly', () => {
  // 1. ARRANGE - Setup data dan mock
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];
  
  // 2. ACT - Jalankan function yang ditest
  const total = calculateTotal(items);
  
  // 3. ASSERT - Verify hasil
  expect(total).toBe(35); // (10*2) + (5*3) = 35
});
```

### 🎭 Mock vs Spy vs Stub

```javascript
// MOCK - Replace entire function
const mockDb = {
  query: jest.fn().mockReturnValue([{ id: 1, name: 'Test' }])
};

// SPY - Watch function calls
const spy = jest.spyOn(console, 'log');
expect(spy).toHaveBeenCalledWith('Hello');

// STUB - Predefined responses
const stub = jest.fn()
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call');
```

---

## 🔧 PART 2: Setup & Tools

### 📁 Test Structure (Refresh)

```
tests/
├── setup.js                   # Global setup
├── env.setup.js              # Environment variables
├── helpers/
│   ├── testHelpers.js        # Test utilities
│   └── mockData.js           # Test data factories
├── unit/                     # Unit tests
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── controllers/
└── integration/              # Integration tests
    ├── api/
    └── middleware/
```

### ⚙️ Jest Configuration Deep Dive

```javascript
// jest.config.js
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',        // Exclude config
    '!src/**/index.js',      // Exclude index files
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Reporters
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  
  // Mock patterns
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### 🔧 Test Helpers

```javascript
// tests/helpers/testHelpers.js
class TestHelpers {
  // Create mock database
  static createMockDb() {
    return {
      execute: jest.fn(),
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn()
    };
  }

  // Create mock request
  static createMockReq(overrides = {}) {
    return {
      params: {},
      body: {},
      query: {},
      headers: {},
      ...overrides
    };
  }

  // Create mock response
  static createMockRes() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
    return res;
  }

  // Create test recipe data
  static createTestRecipe(overrides = {}) {
    return {
      id: 1,
      title: 'Test Recipe',
      ingredients: 'Test ingredients',
      instructions: 'Test instructions',
      cooking_time: 30,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      ...overrides
    };
  }

  // Wait for async operations
  static async waitFor(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Assert error with message
  static expectError(fn, expectedMessage) {
    return expect(fn).rejects.toThrow(expectedMessage);
  }
}

module.exports = TestHelpers;
```

### 📊 Mock Data Factory

```javascript
// tests/helpers/mockData.js
class MockDataFactory {
  static recipe(overrides = {}) {
    return {
      id: this.generateId(),
      title: `Recipe ${this.generateId()}`,
      ingredients: 'Flour, Water, Salt',
      instructions: 'Mix and bake',
      cooking_time: Math.floor(Math.random() * 120) + 15,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides
    };
  }

  static recipes(count = 3) {
    return Array.from({ length: count }, () => this.recipe());
  }

  static invalidRecipe() {
    return {
      title: '', // Invalid: empty title
      ingredients: null, // Invalid: null ingredients
      cooking_time: -10 // Invalid: negative time
    };
  }

  static generateId() {
    return Math.floor(Math.random() * 1000) + 1;
  }

  static dbRows(recipes) {
    return recipes.map(recipe => ({
      ...recipe,
      created_at: recipe.created_at.toISOString(),
      updated_at: recipe.updated_at.toISOString()
    }));
  }
}

module.exports = MockDataFactory;
```

---

## 📝 PART 3: Unit Testing Layer by Layer

## 🔬 Testing Model Layer

### 🎯 **Apa yang Ditest di Model:**
- Data validation
- Data transformation
- toJSON() method
- Static methods
- Edge cases

### 📝 **Complete Model Test Example:**

```javascript
// tests/unit/recipeModel.test.js
const RecipeModel = require('../../src/models/recipeModel');
const MockDataFactory = require('../helpers/mockData');

describe('RecipeModel', () => {
  describe('Constructor', () => {
    test('should create recipe with valid data', () => {
      const data = MockDataFactory.recipe();
      const recipe = new RecipeModel(data);

      expect(recipe.id).toBe(data.id);
      expect(recipe.title).toBe(data.title);
      expect(recipe.ingredients).toBe(data.ingredients);
      expect(recipe.instructions).toBe(data.instructions);
      expect(recipe.cooking_time).toBe(data.cooking_time);
    });

    test('should set default values for missing fields', () => {
      const data = { title: 'Test Recipe' };
      const recipe = new RecipeModel(data);

      expect(recipe.id).toBeNull();
      expect(recipe.created_at).toBeInstanceOf(Date);
      expect(recipe.updated_at).toBeInstanceOf(Date);
    });

    test('should handle undefined/null data gracefully', () => {
      expect(() => new RecipeModel({})).not.toThrow();
      expect(() => new RecipeModel(null)).toThrow();
      expect(() => new RecipeModel(undefined)).toThrow();
    });
  });

  describe('Validation', () => {
    test('should pass validation with valid data', () => {
      const data = MockDataFactory.recipe();
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation with missing title', () => {
      const data = { ingredients: 'Test' };
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    test('should fail validation with short title', () => {
      const data = { title: 'Ab' }; // Less than 3 characters
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
    });

    test('should fail validation with missing ingredients', () => {
      const data = { title: 'Valid Title' };
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ingredients are required');
    });

    test('should fail validation with invalid cooking time', () => {
      const data = {
        title: 'Valid Title',
        ingredients: 'Valid ingredients',
        cooking_time: -5 // Negative time
      };
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cooking time must be positive');
    });

    test('should collect multiple validation errors', () => {
      const data = MockDataFactory.invalidRecipe();
      const result = RecipeModel.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('toJSON', () => {
    test('should return proper JSON representation', () => {
      const data = MockDataFactory.recipe();
      const recipe = new RecipeModel(data);
      const json = recipe.toJSON();

      expect(json).toEqual({
        id: data.id,
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        cooking_time: data.cooking_time,
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    });

    test('should not include internal properties', () => {
      const recipe = new RecipeModel(MockDataFactory.recipe());
      recipe._internal = 'should not appear';
      
      const json = recipe.toJSON();
      expect(json._internal).toBeUndefined();
    });
  });

  describe('Static Methods', () => {
    test('should create from database row', () => {
      const dbRow = {
        ...MockDataFactory.recipe(),
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      };

      const recipe = RecipeModel.fromDatabaseRow(dbRow);
      expect(recipe).toBeInstanceOf(RecipeModel);
      expect(recipe.created_at).toBeInstanceOf(Date);
    });
  });
});
```

## 📚 Testing Repository Layer

### 🎯 **Apa yang Ditest di Repository:**
- CRUD operations
- Database queries
- Error handling
- Data mapping
- Transaction handling

```javascript
// tests/unit/recipeRepository.test.js
const RecipeRepository = require('../../src/repositories/recipeRepository');
const RecipeModel = require('../../src/models/recipeModel');
const TestHelpers = require('../helpers/testHelpers');
const MockDataFactory = require('../helpers/mockData');

describe('RecipeRepository', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = TestHelpers.createMockDb();
    repository = new RecipeRepository(mockDb);
  });

  describe('findAll', () => {
    test('should return all recipes', async () => {
      const mockRecipes = MockDataFactory.recipes(3);
      const mockRows = MockDataFactory.dbRows(mockRecipes);
      mockDb.execute.mockResolvedValue([mockRows]);

      const recipes = await repository.findAll();

      expect(mockDb.execute).toHaveBeenCalledWith('SELECT * FROM recipes');
      expect(recipes).toHaveLength(3);
      expect(recipes[0]).toBeInstanceOf(RecipeModel);
    });

    test('should return empty array when no recipes', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      const recipes = await repository.findAll();

      expect(recipes).toHaveLength(0);
      expect(Array.isArray(recipes)).toBe(true);
    });

    test('should handle database errors', async () => {
      const dbError = new Error('Connection lost');
      mockDb.execute.mockRejectedValue(dbError);

      await expect(repository.findAll())
        .rejects.toThrow('Database error: Connection lost');
    });
  });

  describe('findById', () => {
    test('should return recipe when found', async () => {
      const mockRecipe = MockDataFactory.recipe({ id: 1 });
      const mockRows = MockDataFactory.dbRows([mockRecipe]);
      mockDb.execute.mockResolvedValue([mockRows]);

      const recipe = await repository.findById(1);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE id = ?',
        [1]
      );
      expect(recipe).toBeInstanceOf(RecipeModel);
      expect(recipe.id).toBe(1);
    });

    test('should return null when not found', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      const recipe = await repository.findById(999);

      expect(recipe).toBeNull();
    });

    test('should handle invalid ID types', async () => {
      await expect(repository.findById('invalid'))
        .rejects.toThrow('Invalid ID format');
      
      await expect(repository.findById(null))
        .rejects.toThrow('ID is required');
    });
  });

  describe('create', () => {
    test('should create new recipe', async () => {
      const recipeData = MockDataFactory.recipe({ id: undefined });
      mockDb.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

      const recipe = await repository.create(recipeData);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'INSERT INTO recipes (title, ingredients, instructions, cooking_time) VALUES (?, ?, ?, ?)',
        [recipeData.title, recipeData.ingredients, recipeData.instructions, recipeData.cooking_time]
      );
      expect(recipe.id).toBe(1);
      expect(recipe).toBeInstanceOf(RecipeModel);
    });

    test('should validate data before creation', async () => {
      const invalidData = MockDataFactory.invalidRecipe();

      await expect(repository.create(invalidData))
        .rejects.toThrow('Validation error');
      
      expect(mockDb.execute).not.toHaveBeenCalled();
    });

    test('should handle database constraint errors', async () => {
      const recipeData = MockDataFactory.recipe();
      const constraintError = new Error('Duplicate entry');
      constraintError.code = 'ER_DUP_ENTRY';
      mockDb.execute.mockRejectedValue(constraintError);

      await expect(repository.create(recipeData))
        .rejects.toThrow('Recipe with this title already exists');
    });
  });

  describe('update', () => {
    test('should update existing recipe', async () => {
      const recipeData = MockDataFactory.recipe({ id: 1 });
      mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const recipe = await repository.update(1, recipeData);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, cooking_time = ?, updated_at = ? WHERE id = ?',
        [recipeData.title, recipeData.ingredients, recipeData.instructions, recipeData.cooking_time, expect.any(Date), 1]
      );
      expect(recipe.id).toBe(1);
    });

    test('should throw error when recipe not found', async () => {
      mockDb.execute.mockResolvedValue([{ affectedRows: 0 }]);

      await expect(repository.update(999, {}))
        .rejects.toThrow('Recipe not found');
    });
  });

  describe('delete', () => {
    test('should delete recipe', async () => {
      mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await repository.delete(1);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM recipes WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    test('should return false when recipe not found', async () => {
      mockDb.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await repository.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('Transaction handling', () => {
    test('should handle transaction in batch operations', async () => {
      const recipes = MockDataFactory.recipes(3);
      mockDb.beginTransaction.mockResolvedValue();
      mockDb.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);
      mockDb.commit.mockResolvedValue();

      await repository.createBatch(recipes);

      expect(mockDb.beginTransaction).toHaveBeenCalled();
      expect(mockDb.execute).toHaveBeenCalledTimes(3);
      expect(mockDb.commit).toHaveBeenCalled();
    });

    test('should rollback on error', async () => {
      const recipes = MockDataFactory.recipes(2);
      mockDb.beginTransaction.mockResolvedValue();
      mockDb.execute
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockRejectedValueOnce(new Error('Database error'));
      mockDb.rollback.mockResolvedValue();

      await expect(repository.createBatch(recipes))
        .rejects.toThrow('Database error');

      expect(mockDb.rollback).toHaveBeenCalled();
    });
  });
});
```

## ⚙️ Testing Service Layer

### 🎯 **Apa yang Ditest di Service:**
- Business logic
- Multiple repository calls
- Error handling
- Data transformation
- Business rules

```javascript
// tests/unit/recipeService.test.js
const RecipeService = require('../../src/services/recipeService');
const TestHelpers = require('../helpers/testHelpers');
const MockDataFactory = require('../helpers/mockData');

describe('RecipeService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    service = new RecipeService(mockRepository);
  });

  describe('getAllRecipes', () => {
    test('should return all recipes in JSON format', async () => {
      const mockRecipes = MockDataFactory.recipes(2).map(data => 
        Object.assign(data, { toJSON: () => data })
      );
      mockRepository.findAll.mockResolvedValue(mockRecipes);

      const recipes = await service.getAllRecipes();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(recipes).toHaveLength(2);
      expect(recipes[0]).toEqual(mockRecipes[0]);
    });

    test('should handle repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('DB Error'));

      await expect(service.getAllRecipes())
        .rejects.toThrow('Service error: DB Error');
    });
  });

  describe('getRecipeById', () => {
    test('should return recipe when found', async () => {
      const mockRecipe = MockDataFactory.recipe({ id: 1 });
      mockRecipe.toJSON = () => mockRecipe;
      mockRepository.findById.mockResolvedValue(mockRecipe);

      const recipe = await service.getRecipeById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(recipe.id).toBe(1);
    });

    test('should throw error for invalid ID', async () => {
      await expect(service.getRecipeById('invalid'))
        .rejects.toThrow('Invalid recipe ID');
      
      await expect(service.getRecipeById(null))
        .rejects.toThrow('Invalid recipe ID');
    });

    test('should throw error when recipe not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getRecipeById(999))
        .rejects.toThrow('Recipe not found');
    });
  });

  describe('createRecipe', () => {
    test('should create recipe with unique title', async () => {
      const recipeData = MockDataFactory.recipe({ id: undefined });
      const createdRecipe = { ...recipeData, id: 1, toJSON: () => recipeData };
      
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue(createdRecipe);

      const recipe = await service.createRecipe(recipeData);

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(recipeData);
      expect(recipe.title).toBe(recipeData.title);
    });

    test('should prevent duplicate titles (case insensitive)', async () => {
      const existingRecipes = [
        { title: 'Existing Recipe', toJSON: () => ({}) }
      ];
      mockRepository.findAll.mockResolvedValue(existingRecipes);

      const newRecipeData = { title: 'existing recipe' }; // Lowercase

      await expect(service.createRecipe(newRecipeData))
        .rejects.toThrow('Recipe with this title already exists');
      
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    test('should handle business rules', async () => {
      const recipeData = {
        title: 'Quick Recipe',
        cooking_time: 5 // Very quick recipe
      };

      mockRepository.findAll.mockResolvedValue([]);

      // Business rule: Recipes under 10 minutes get "Quick" tag
      const createdRecipe = { 
        ...recipeData, 
        id: 1, 
        tags: ['Quick'],
        toJSON: () => ({ ...recipeData, tags: ['Quick'] })
      };
      mockRepository.create.mockResolvedValue(createdRecipe);

      const recipe = await service.createRecipe(recipeData);

      expect(recipe.tags).toContain('Quick');
    });
  });

  describe('updateRecipe', () => {
    test('should update existing recipe', async () => {
      const existingRecipe = MockDataFactory.recipe({ id: 1 });
      const updateData = { title: 'Updated Title' };
      const updatedRecipe = { 
        ...existingRecipe, 
        ...updateData, 
        updated_at: new Date(),
        toJSON: () => ({ ...existingRecipe, ...updateData })
      };

      mockRepository.findById.mockResolvedValue(existingRecipe);
      mockRepository.update.mockResolvedValue(updatedRecipe);

      const recipe = await service.updateRecipe(1, updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        ...existingRecipe,
        ...updateData,
        updated_at: expect.any(Date)
      }));
      expect(recipe.title).toBe('Updated Title');
    });

    test('should validate update data', async () => {
      const invalidUpdate = { title: '' }; // Invalid title

      await expect(service.updateRecipe(1, invalidUpdate))
        .rejects.toThrow('Validation error');
    });
  });

  describe('deleteRecipe', () => {
    test('should delete existing recipe', async () => {
      const existingRecipe = MockDataFactory.recipe({ id: 1 });
      mockRepository.findById.mockResolvedValue(existingRecipe);
      mockRepository.delete.mockResolvedValue(true);

      const result = await service.deleteRecipe(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    test('should throw error when recipe not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteRecipe(999))
        .rejects.toThrow('Recipe not found');
      
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Business Logic Edge Cases', () => {
    test('should handle cooking time calculations', async () => {
      const recipes = [
        { cooking_time: 15, toJSON: () => ({}) },
        { cooking_time: 30, toJSON: () => ({}) },
        { cooking_time: 45, toJSON: () => ({}) }
      ];
      mockRepository.findAll.mockResolvedValue(recipes);

      const avgTime = await service.getAverageCookingTime();

      expect(avgTime).toBe(30); // (15+30+45)/3
    });

    test('should categorize recipes by cooking time', async () => {
      const recipeData = { cooking_time: 15 };
      
      const category = service.categorizeRecipe(recipeData);
      
      expect(category).toBe('Quick'); // Under 20 minutes
    });
  });
});
```

## 🌐 Testing Controller Layer

### 🎯 **Apa yang Ditest di Controller:**
- HTTP request handling
- Response formatting
- Status codes
- Error handling
- Parameter validation

```javascript
// tests/unit/recipeController.test.js
const RecipeController = require('../../src/controllers/recipeController');
const TestHelpers = require('../helpers/testHelpers');
const MockDataFactory = require('../helpers/mockData');

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
    
    req = TestHelpers.createMockReq();
    res = TestHelpers.createMockRes();
    next = jest.fn();
  });

  describe('getAllRecipes', () => {
    test('should return all recipes with success response', async () => {
      const mockRecipes = MockDataFactory.recipes(2);
      mockService.getAllRecipes.mockResolvedValue(mockRecipes);

      await controller.getAllRecipes(req, res, next);

      expect(mockService.getAllRecipes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecipes,
        message: 'Recipes retrieved successfully',
        count: mockRecipes.length
      });
    });

    test('should handle service errors', async () => {
      const error = new Error('Service error');
      mockService.getAllRecipes.mockRejectedValue(error);

      await controller.getAllRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('should handle query parameters', async () => {
      req.query = { limit: '10', offset: '0' };
      const mockRecipes = MockDataFactory.recipes(5);
      mockService.getAllRecipes.mockResolvedValue(mockRecipes);

      await controller.getAllRecipes(req, res, next);

      expect(mockService.getAllRecipes).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      });
    });
  });

  describe('getRecipeById', () => {
    test('should return recipe when found', async () => {
      req.params = { id: '1' };
      const mockRecipe = MockDataFactory.recipe({ id: 1 });
      mockService.getRecipeById.mockResolvedValue(mockRecipe);

      await controller.getRecipeById(req, res, next);

      expect(mockService.getRecipeById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecipe,
        message: 'Recipe retrieved successfully'
      });
    });

    test('should handle invalid ID format', async () => {
      req.params = { id: 'invalid' };

      await controller.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid recipe ID format'
      });
    });

    test('should handle missing ID parameter', async () => {
      req.params = {}; // No ID provided

      await controller.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe ID is required'
      });
    });
  });

  describe('createRecipe', () => {
    test('should create recipe with valid data', async () => {
      const recipeData = MockDataFactory.recipe({ id: undefined });
      const createdRecipe = { ...recipeData, id: 1 };
      
      req.body = recipeData;
      mockService.createRecipe.mockResolvedValue(createdRecipe);

      await controller.createRecipe(req, res, next);

      expect(mockService.createRecipe).toHaveBeenCalledWith(recipeData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdRecipe,
        message: 'Recipe created successfully'
      });
    });

    test('should validate request body', async () => {
      req.body = {}; // Empty body

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Request body is required'
      });
    });

    test('should handle large payload', async () => {
      const largePayload = {
        title: 'A'.repeat(1000), // Very long title
        ingredients: 'B'.repeat(10000) // Very long ingredients
      };
      req.body = largePayload;

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Payload too large'
      });
    });
  });

  describe('updateRecipe', () => {
    test('should update recipe with valid data', async () => {
      req.params = { id: '1' };
      req.body = { title: 'Updated Recipe' };
      const updatedRecipe = MockDataFactory.recipe({ 
        id: 1, 
        title: 'Updated Recipe' 
      });
      
      mockService.updateRecipe.mockResolvedValue(updatedRecipe);

      await controller.updateRecipe(req, res, next);

      expect(mockService.updateRecipe).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRecipe,
        message: 'Recipe updated successfully'
      });
    });

    test('should handle partial updates', async () => {
      req.params = { id: '1' };
      req.body = { cooking_time: 45 }; // Only update cooking time
      
      const updatedRecipe = MockDataFactory.recipe({ 
        id: 1, 
        cooking_time: 45 
      });
      mockService.updateRecipe.mockResolvedValue(updatedRecipe);

      await controller.updateRecipe(req, res, next);

      expect(mockService.updateRecipe).toHaveBeenCalledWith(1, { cooking_time: 45 });
    });
  });

  describe('deleteRecipe', () => {
    test('should delete recipe successfully', async () => {
      req.params = { id: '1' };
      mockService.deleteRecipe.mockResolvedValue(true);

      await controller.deleteRecipe(req, res, next);

      expect(mockService.deleteRecipe).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recipe deleted successfully'
      });
    });

    test('should handle recipe not found', async () => {
      req.params = { id: '999' };
      const error = new Error('Recipe not found');
      mockService.deleteRecipe.mockRejectedValue(error);

      await controller.deleteRecipe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockService.getAllRecipes.mockImplementation(() => {
        throw unexpectedError;
      });

      await controller.getAllRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(unexpectedError);
    });

    test('should sanitize error messages in production', async () => {
      process.env.NODE_ENV = 'production';
      const sensitiveError = new Error('Database password is incorrect');
      mockService.getAllRecipes.mockRejectedValue(sensitiveError);

      await controller.getAllRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.not.stringContaining('password')
        })
      );
      
      process.env.NODE_ENV = 'test'; // Reset
    });
  });
});
```

---

## 🔗 PART 4: Integration Testing

### 🎯 **Integration Test Focus:**
- API endpoints dengan middleware
- Database integration real
- Component interaction
- Full request-response cycle

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');
const TestHelpers = require('../helpers/testHelpers');
const MockDataFactory = require('../helpers/mockData');

describe('Recipe API Integration Tests', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0); // Random available port
    await TestHelpers.setupTestDatabase();
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestDatabase();
    await server.close();
  });

  beforeEach(async () => {
    await TestHelpers.clearTestData();
  });

  describe('GET /api/recipes', () => {
    test('should return empty array when no recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('should return all recipes', async () => {
      // Setup test data
      const testRecipes = await TestHelpers.createTestRecipes(3);

      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    test('should handle query parameters', async () => {
      await TestHelpers.createTestRecipes(10);

      const response = await request(app)
        .get('/api/recipes?limit=5&offset=2')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
    });

    test('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
  });

  describe('GET /api/recipes/:id', () => {
    test('should return recipe when found', async () => {
      const testRecipe = await TestHelpers.createTestRecipe();

      const response = await request(app)
        .get(`/api/recipes/${testRecipe.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testRecipe.id);
      expect(response.body.data.title).toBe(testRecipe.title);
    });

    test('should return 404 when recipe not found', async () => {
      const response = await request(app)
        .get('/api/recipes/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/recipes/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('POST /api/recipes', () => {
    test('should create recipe with valid data', async () => {
      const recipeData = MockDataFactory.recipe({ id: undefined });

      const response = await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(recipeData.title);
      expect(response.body.data.id).toBeDefined();

      // Verify recipe was actually created in database
      const getResponse = await request(app)
        .get(`/api/recipes/${response.body.data.id}`)
        .expect(200);
      
      expect(getResponse.body.data.title).toBe(recipeData.title);
    });

    test('should return 400 for invalid data', async () => {
      const invalidData = { title: '' }; // Invalid title

      const response = await request(app)
        .post('/api/recipes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation');
    });

    test('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    test('should prevent duplicate titles', async () => {
      const recipeData = MockDataFactory.recipe();
      
      // Create first recipe
      await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/recipes')
        .send({ ...recipeData, title: recipeData.title.toLowerCase() })
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('PUT /api/recipes/:id', () => {
    test('should update existing recipe', async () => {
      const testRecipe = await TestHelpers.createTestRecipe();
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/recipes/${testRecipe.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.id).toBe(testRecipe.id);
    });

    test('should return 404 for non-existent recipe', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/recipes/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    test('should delete existing recipe', async () => {
      const testRecipe = await TestHelpers.createTestRecipe();

      const response = await request(app)
        .delete(`/api/recipes/${testRecipe.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify recipe was deleted
      await request(app)
        .get(`/api/recipes/${testRecipe.id}`)
        .expect(404);
    });

    test('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .delete('/api/recipes/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Middleware Integration', () => {
    test('should log requests', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/recipes')
      );

      logSpy.mockRestore();
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(request(app).get('/api/recipes'));
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate Content-Type for POST requests', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400);

      expect(response.body.error).toContain('Content-Type');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle database connection errors gracefully', async () => {
      // Simulate database connection loss
      await TestHelpers.simulateDbConnectionLoss();

      const response = await request(app)
        .get('/api/recipes')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal Server Error');

      // Restore connection
      await TestHelpers.restoreDbConnection();
    });

    test('should not expose sensitive error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Force an error
      await TestHelpers.simulateDbConnectionLoss();

      const response = await request(app)
        .get('/api/recipes')
        .expect(500);

      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
      await TestHelpers.restoreDbConnection();
    });
  });
});
```

---

## 📊 PART 5: Coverage & Best Practices

### 🎯 Coverage Analysis

```javascript
// Example coverage report analysis
/*
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
src/models/             |   98.5  |   95.2   |  100.0  |   98.1  |
src/repositories/       |   95.7  |   89.1   |   96.4  |   94.8  |
src/services/           |   97.2  |   92.8   |   98.9  |   96.5  |
src/controllers/        |   93.8  |   87.3   |   94.7  |   92.9  |
src/middleware/         |   91.4  |   85.6   |   89.2  |   90.8  |
------------------------|---------|----------|---------|---------|
All files               |   95.3  |   90.0   |   95.8  |   94.6  |
*/
```

### ✅ **Testing Best Practices:**

#### **1. Test Structure**
```javascript
// ✅ Good - Clear, descriptive structure
describe('RecipeService', () => {
  describe('createRecipe', () => {
    describe('when data is valid', () => {
      test('should create recipe successfully', () => {
        // Test implementation
      });
    });

    describe('when data is invalid', () => {
      test('should throw validation error', () => {
        // Test implementation
      });
    });
  });
});

// ❌ Bad - Flat structure
describe('RecipeService', () => {
  test('should create recipe', () => {});
  test('should fail with invalid data', () => {});
  test('should update recipe', () => {});
});
```

#### **2. Test Data Management**
```javascript
// ✅ Good - Use factories
const recipe = MockDataFactory.recipe({ title: 'Specific Title' });

// ❌ Bad - Hardcode data everywhere
const recipe = {
  id: 1,
  title: 'Hardcoded Recipe',
  ingredients: 'Hardcoded ingredients'
};
```

#### **3. Assertions**
```javascript
// ✅ Good - Specific assertions
expect(response.status).toBe(201);
expect(response.body.success).toBe(true);
expect(response.body.data.title).toBe('Expected Title');

// ❌ Bad - Vague assertions
expect(response).toBeTruthy();
expect(response.body).toBeDefined();
```

### 🚫 **Common Testing Pitfalls:**

#### **1. Over-mocking**
```javascript
// ❌ Bad - Mock everything
const mockDate = jest.fn().mockReturnValue('2024-01-01');
Date.now = mockDate;

// ✅ Good - Mock only what's necessary
const mockDb = { execute: jest.fn() };
```

#### **2. Test Dependencies**
```javascript
// ❌ Bad - Tests depend on each other
test('should create recipe', async () => {
  window.createdRecipeId = recipe.id; // Global state
});

test('should update recipe', async () => {
  await service.update(window.createdRecipeId); // Depends on previous test
});

// ✅ Good - Independent tests
beforeEach(() => {
  // Setup fresh state for each test
});
```

#### **3. Testing Implementation Details**
```javascript
// ❌ Bad - Testing internal implementation
test('should call database three times', () => {
  expect(mockDb.execute).toHaveBeenCalledTimes(3);
});

// ✅ Good - Testing behavior
test('should return all recipes', () => {
  expect(recipes).toHaveLength(3);
  expect(recipes[0]).toHaveProperty('title');
});
```

### 📈 **Performance Testing Tips:**

```javascript
// Performance test example
describe('Performance Tests', () => {
  test('should handle large datasets efficiently', async () => {
    const startTime = Date.now();
    const largeDataset = MockDataFactory.recipes(1000);
    
    await service.processBatch(largeDataset);
    
    const executionTime = Date.now() - startTime;
    expect(executionTime).toBeLessThan(5000); // Under 5 seconds
  });

  test('should handle concurrent requests', async () => {
    const promises = Array.from({ length: 50 }, () => 
      service.getAllRecipes()
    );

    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(50);
    expect(results.every(r => Array.isArray(r))).toBe(true);
  });
});
```

---

## 🎯 Summary & Next Steps

### ✅ **Apa yang Sudah Dipelajari:**
- [x] Konsep dasar testing (Unit, Integration, E2E)
- [x] Setup testing environment dengan Jest
- [x] Testing setiap layer (Model, Repository, Service, Controller)
- [x] Integration testing dengan supertest
- [x] Mocking strategies dan best practices
- [x] Coverage analysis dan optimization

### 🚀 **Challenge Selanjutnya:**
1. **Implement E2E Testing** dengan Cypress/Playwright
2. **Performance Testing** dengan load testing tools
3. **Security Testing** untuk vulnerability assessment
4. **Contract Testing** untuk API contracts
5. **Visual Regression Testing** untuk UI components

### 📚 **Resources untuk Belajar Lebih Lanjut:**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

*Happy Testing! 🧪✨*

> **Pro Tip:** Testing bukan hanya tentang mencari bug, tapi juga tentang membangun confidence dalam kode dan memudahkan refactoring di masa depan.
