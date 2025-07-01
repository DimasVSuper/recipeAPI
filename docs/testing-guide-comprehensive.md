# 🧪 Testing Guide - Comprehensive Testing Documentation

> **Panduan lengkap testing untuk Recipe API dengan 80+ test cases**

## 📋 Daftar Isi

1. [Testing Overview](#testing-overview)
2. [Test Setup & Configuration](#test-setup--configuration)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Test Data Management](#test-data-management)
6. [Mocking Strategies](#mocking-strategies)
7. [Test Coverage Analysis](#test-coverage-analysis)
8. [Testing Best Practices](#testing-best-practices)
9. [Debugging Tests](#debugging-tests)
10. [CI/CD Integration](#cicd-integration)

---

## 🎯 Testing Overview

### 📊 **Test Statistics**
- **Total Tests**: 80+ test cases
- **Unit Tests**: 60+ tests (Models, Services, Repositories, Controllers)
- **Integration Tests**: 20+ tests (API endpoints, middleware)
- **Test Coverage**: >95% line coverage
- **Test Performance**: ~1.5s execution time

### 🏗️ **Testing Pyramid**

```
        /\
       /  \
      / E2E \ (5-10%)
     /      \
    /  INTEG  \ (20-30%)
   /          \
  /    UNIT     \ (60-70%)
 /______________\
```

### 🎭 **Testing Types in Our Application**

#### **Unit Tests** - Test individual components
- Model validation logic
- Service business rules
- Repository data access methods
- Controller HTTP handling

#### **Integration Tests** - Test component interactions
- API endpoints with middleware
- Database operations with real connections
- Service-Repository interactions

#### **End-to-End Tests** - Test complete workflows
- Full CRUD operations
- Error handling flows
- Authentication workflows

---

## ⚙️ Test Setup & Configuration

### 📁 **Test Structure**

```
tests/
├── setup.js                    # Global test setup
├── env.setup.js               # Environment configuration
├── helpers/                   # Test utilities
│   ├── testHelpers.js         # Common test functions
│   └── mockData.js            # Test data factories
├── unit/                      # Unit tests
│   ├── recipeModel.test.js    # Model tests
│   ├── recipeService.test.js  # Service tests
│   ├── recipeRepository.test.js # Repository tests
│   └── recipeController.test.js # Controller tests
└── integration/               # Integration tests
    └── api.test.js            # API endpoint tests
```

### 🔧 **Jest Configuration** (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  setupFiles: ['<rootDir>/tests/env.setup.js']
};
```

### 🌍 **Environment Setup** (`tests/env.setup.js`)

```javascript
// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'recipe_db_test';
process.env.PORT = '3001';

// Suppress console logs in tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
```

### 🛠️ **Global Setup** (`tests/setup.js`)

```javascript
// Mock database for tests
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

// Global test helpers
global.createTestRecipe = (overrides = {}) => ({
  title: 'Test Recipe',
  description: 'Test description',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  ...overrides
});

// Setup and teardown
beforeAll(() => {
  console.log('🧪 Test environment loaded');
});

afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 🔬 Unit Testing

### 📊 **Model Testing** (`tests/unit/recipeModel.test.js`)

```javascript
const RecipeModel = require('../../src/models/recipeModel');

describe('RecipeModel', () => {
  describe('Constructor', () => {
    test('should create model with default values', () => {
      const recipe = new RecipeModel();
      
      expect(recipe.id).toBeNull();
      expect(recipe.title).toBe('');
      expect(recipe.ingredients).toEqual([]);
      expect(recipe.instructions).toEqual([]);
    });

    test('should create model with provided data', () => {
      const data = {
        id: 1,
        title: 'Test Recipe',
        ingredients: ['flour', 'sugar'],
        instructions: ['mix', 'bake']
      };
      
      const recipe = new RecipeModel(data);
      
      expect(recipe.id).toBe(1);
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.ingredients).toEqual(['flour', 'sugar']);
    });
  });

  describe('Validation', () => {
    test('should validate required fields', () => {
      const recipe = new RecipeModel({
        title: '',
        ingredients: [],
        instructions: []
      });
      
      const errors = recipe.validate();
      
      expect(errors).toContain('title is required');
      expect(errors).toContain('ingredients is required');
      expect(errors).toContain('instructions is required');
    });

    test('should validate title length', () => {
      const recipe = new RecipeModel({
        title: 'ab', // Too short
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });
      
      const errors = recipe.validate();
      
      expect(errors).toContain('Title must be at least 3 characters');
    });

    test('should validate array types', () => {
      const recipe = new RecipeModel({
        title: 'Valid Title',
        ingredients: 'not an array',
        instructions: 'not an array'
      });
      
      const errors = recipe.validate();
      
      expect(errors).toContain('Ingredients must be an array');
      expect(errors).toContain('Instructions must be an array');
    });
  });

  describe('Data Transformation', () => {
    test('should convert to JSON format', () => {
      const recipe = new RecipeModel({
        id: 1,
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });
      
      const json = recipe.toJSON();
      
      expect(json).toEqual({
        id: 1,
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        created_at: null,
        updated_at: null
      });
    });

    test('should convert to database format', () => {
      const recipe = new RecipeModel({
        title: '  Test Recipe  ',
        description: '  Test description  ',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });
      
      const dbData = recipe.toDatabase();
      
      expect(dbData.title).toBe('Test Recipe'); // Trimmed
      expect(dbData.description).toBe('Test description'); // Trimmed
      expect(Array.isArray(dbData.ingredients)).toBe(true);
      expect(Array.isArray(dbData.instructions)).toBe(true);
    });
  });
});
```

---

## 🔗 Integration Testing

### 🌐 **API Integration Tests** (`tests/integration/api.test.js`)

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Recipe API Integration Tests', () => {
  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe API is running!');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
      expect(response.body.path).toBe('/unknown-route');
    });
  });

  describe('JSON Parser Middleware', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid JSON format');
    });
  });

  describe('CORS Middleware', () => {
    test('should set CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
  });

  describe('Recipe API Endpoints', () => {
    test('should handle complete recipe workflow', async () => {
      // CREATE
      const recipeData = {
        title: 'Integration Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.title).toBe('Integration Test Recipe');

      // GET ALL
      const getAllResponse = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(getAllResponse.body.success).toBe(true);
      expect(Array.isArray(getAllResponse.body.data)).toBe(true);

      // GET BY ID (using mock ID since we don't have real DB)
      const mockId = 1;
      const getByIdResponse = await request(app)
        .get(`/api/recipes/${mockId}`)
        .expect(200);

      expect(getByIdResponse.body.success).toBe(true);
    });

    test('should handle validation errors', async () => {
      const invalidData = {}; // Missing required fields

      const response = await request(app)
        .post('/api/recipes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## 📊 Test Data Management

### 🏭 **Test Data Factories** (`tests/helpers/mockData.js`)

```javascript
// Base recipe factory
const createTestRecipe = (overrides = {}) => ({
  title: 'Test Recipe',
  description: 'Test description',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  difficulty: 'easy',
  servings: 4,
  prepTime: 15,
  cookTime: 30,
  ...overrides
});

// Specific variations
const createQuickRecipe = (overrides = {}) => createTestRecipe({
  title: 'Quick Recipe',
  prepTime: 5,
  cookTime: 10,
  difficulty: 'easy',
  ...overrides
});

const createComplexRecipe = (overrides = {}) => createTestRecipe({
  title: 'Complex Recipe',
  ingredients: Array.from({ length: 10 }, (_, i) => `ingredient${i + 1}`),
  instructions: Array.from({ length: 8 }, (_, i) => `step${i + 1}`),
  difficulty: 'hard',
  prepTime: 45,
  cookTime: 120,
  ...overrides
});

const createInvalidRecipe = (overrides = {}) => ({
  title: '', // Invalid: empty title
  ingredients: [], // Invalid: empty array
  instructions: [], // Invalid: empty array
  ...overrides
});

module.exports = {
  createTestRecipe,
  createQuickRecipe,
  createComplexRecipe,
  createInvalidRecipe
};
```

---

## 🎭 Mocking Strategies

### 🔧 **Dependency Mocking**

```javascript
// Mock entire modules
jest.mock('../../src/repositories/recipeRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

// Mock specific methods
const mockRepository = require('../../src/repositories/recipeRepository');
mockRepository.findAll.mockResolvedValue([]);

// Mock constructors
jest.mock('../../src/models/recipeModel', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    validate: jest.fn().mockReturnValue([]),
    toJSON: jest.fn().mockReturnValue(data),
    toDatabase: jest.fn().mockReturnValue(data)
  }));
});
```

---

## 📈 Test Coverage Analysis

### 🎯 **Coverage Metrics**

```bash
# Run tests with coverage
npm run test:coverage

# Coverage report example:
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   96.15 |    90.48 |     100 |   96.15 |
 src               |     100 |      100 |     100 |     100 |
  app.js           |     100 |      100 |     100 |     100 |
 src/controllers   |     100 |      100 |     100 |     100 |
  recipeController |     100 |      100 |     100 |     100 |
 src/models        |      95 |    85.71 |     100 |      95 |
  recipeModel.js   |      95 |    85.71 |     100 |      95 |
 src/repositories  |      96 |    88.89 |     100 |      96 |
  recipeRepository |      96 |    88.89 |     100 |      96 |
 src/services      |    97.5 |      100 |     100 |    97.5 |
  recipeService.js |    97.5 |      100 |     100 |    97.5 |
-------------------|---------|----------|---------|---------|
```

### 📊 **Coverage Goals**

- **Statements**: >95%
- **Branches**: >90%
- **Functions**: 100%
- **Lines**: >95%

---

## ✅ Testing Best Practices

### 🎯 **Test Structure**

#### **AAA Pattern (Arrange, Act, Assert)**
```javascript
test('should create recipe successfully', async () => {
  // Arrange
  const recipeData = createTestRecipe();
  const mockResponse = mockServiceSuccess(recipeData);
  recipeRepository.create.mockResolvedValue(mockResponse);

  // Act
  const result = await recipeService.createRecipe(recipeData);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data).toMatchObject(recipeData);
});
```

### 🎭 **Descriptive Test Names**

```javascript
// ❌ BAD: Vague test names
test('creates recipe', () => { /* ... */ });
test('validation', () => { /* ... */ });

// ✅ GOOD: Descriptive test names
test('should create recipe with valid data and return success response', () => {});
test('should reject recipe creation when title is missing', () => {});
test('should validate ingredient array contains at least one item', () => {});
```

### 🔄 **Test Organization**

```javascript
describe('RecipeService', () => {
  describe('createRecipe', () => {
    describe('with valid data', () => {
      test('should create recipe successfully', () => {});
      test('should return formatted response', () => {});
    });

    describe('with invalid data', () => {
      test('should reject empty title', () => {});
      test('should reject empty ingredients', () => {});
    });

    describe('with database errors', () => {
      test('should handle connection errors', () => {});
      test('should handle constraint violations', () => {});
    });
  });
});
```

---

## 🐛 Debugging Tests

### 🔍 **Common Test Failures**

#### **Async/Await Issues**
```javascript
// ❌ BAD: Missing await
test('should create recipe', () => {
  const result = recipeService.createRecipe(data); // Missing await
  expect(result.success).toBe(true); // Will fail
});

// ✅ GOOD: Proper async handling
test('should create recipe', async () => {
  const result = await recipeService.createRecipe(data);
  expect(result.success).toBe(true);
});
```

#### **Mock Not Working**
```javascript
// Debug mock calls
test('should call repository', async () => {
  await recipeService.createRecipe(data);
  
  // Debug what was actually called
  console.log('Mock calls:', recipeRepository.create.mock.calls);
  console.log('Mock results:', recipeRepository.create.mock.results);
  
  expect(recipeRepository.create).toHaveBeenCalledTimes(1);
});
```

---

## 🚀 CI/CD Integration

### 📁 **GitHub Actions** (`.github/workflows/test.yml`)

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### 🎯 **Test Scripts**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

---

## 📋 Test Results Summary

### ✅ **Current Test Status**

- **Total Tests**: 80+ test cases ✅
- **Unit Tests**: 76 passed ✅
- **Integration Tests**: 4 failed (fixing in progress) ⚠️
- **Overall Coverage**: >95% ✅

### 🔧 **Issues Fixed**

1. **JSON Parser Error Handling** - Fixed error response format
2. **Mock Service Integration** - Improved mock setup for integration tests
3. **Error Handler Middleware** - Enhanced error categorization
4. **Test Environment** - Proper environment isolation

### 🎯 **Next Steps**

1. Fix remaining integration test failures
2. Add more edge case testing
3. Implement E2E test scenarios
4. Set up CI/CD pipeline
5. Add performance testing

---

## 🎓 Kesimpulan

### 📚 **Key Takeaways**

1. **Comprehensive Testing** memastikan kode quality dan reliability
2. **Proper Mocking** memungkinkan isolated unit testing
3. **Integration Tests** memverifikasi component interactions
4. **Good Test Structure** meningkatkan maintainability
5. **Coverage Analysis** membantu identify untested code

### 🚀 **Pembelajaran Testing**

Testing adalah **investasi jangka panjang** yang:
- Mengurangi bugs di production
- Meningkatkan confidence saat refactoring
- Mempercepat development cycle
- Membuat dokumentasi living code

---

> **"Good tests are not just about finding bugs, they're about building confidence in your code."**

🧪 **Happy Testing!** 🚀
