# 🧪 Testing Documentation

> **Comprehensive testing strategy untuk Recipe API**

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Unit Tests](#unit-tests)
6. [Integration Tests](#integration-tests)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Recipe API menggunakan **comprehensive testing strategy** dengan:

- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **Mocking** - Database dan external dependencies
- **Coverage Reports** - Code coverage analysis

### ✅ **Test Types:**

- 🔧 **Unit Tests** - Individual components (Model, Repository, Service, Controller)
- 🔗 **Integration Tests** - Complete API workflow
- 📊 **Coverage Tests** - Code coverage analysis

---

## 📁 Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── unit/                       # Unit tests
│   ├── recipeModel.test.js     # Model layer tests
│   ├── recipeRepository.test.js # Repository layer tests  
│   ├── recipeService.test.js   # Service layer tests
│   └── recipeController.test.js # Controller layer tests
└── integration/                # Integration tests
    └── api.test.js            # Full API workflow tests
```

---

## 🚀 Running Tests

### **Basic Commands:**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- recipeModel.test.js

# Run tests matching pattern
npm test -- --testNamePattern="create"
```

### **Test Scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📊 Test Coverage

### **Coverage Configuration:**

```json
{
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/config/db.js",
    "!index.js"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"]
}
```

### **Coverage Reports:**

- **Terminal** - Summary in console
- **HTML** - Detailed report in `coverage/` folder
- **LCOV** - For CI/CD integration

### **Coverage Goals:**

- **Statements** - 90%+
- **Branches** - 85%+
- **Functions** - 95%+
- **Lines** - 90%+

---

## 🔧 Unit Tests

### **1. Model Tests** (`recipeModel.test.js`)

```javascript
describe('RecipeModel', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const recipe = new RecipeModel();
      expect(recipe.title).toBe('');
      expect(recipe.ingredients).toEqual([]);
    });
  });

  describe('validate()', () => {
    test('should return no errors for valid data', () => {
      const recipe = new RecipeModel({
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });
      
      const errors = recipe.validate();
      expect(errors).toEqual([]);
    });
  });
});
```

**Test Coverage:**
- ✅ Constructor with/without data
- ✅ Static methods (getSchema, getRequiredFields)
- ✅ Instance methods (validate, toJSON, toDatabase)
- ✅ Validation rules
- ✅ Data transformation

### **2. Repository Tests** (`recipeRepository.test.js`)

```javascript
describe('RecipeRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    test('should return array of RecipeModel instances', async () => {
      db.query.mockResolvedValue([mockRows]);
      
      const result = await recipeRepository.findAll();
      
      expect(result[0]).toBeInstanceOf(RecipeModel);
    });
  });
});
```

**Test Coverage:**
- ✅ All CRUD operations
- ✅ Database mocking
- ✅ Model integration
- ✅ Error handling
- ✅ Data validation

### **3. Service Tests** (`recipeService.test.js`)

```javascript
describe('RecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRecipe()', () => {
    test('should create recipe with valid data', async () => {
      recipeRepository.create.mockResolvedValue(mockRecipe);
      
      const result = await recipeService.createRecipe(validData);
      
      expect(result.success).toBe(true);
    });
  });
});
```

**Test Coverage:**
- ✅ Business logic validation
- ✅ Repository coordination
- ✅ Response formatting
- ✅ Error handling
- ✅ Model integration

### **4. Controller Tests** (`recipeController.test.js`)

```javascript
describe('RecipeController', () => {
  describe('GET /recipes', () => {
    test('should return all recipes successfully', async () => {
      recipeService.getAllRecipes.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .get('/recipes')
        .expect(200);
      
      expect(response.body).toEqual(mockResponse);
    });
  });
});
```

**Test Coverage:**
- ✅ HTTP request/response handling
- ✅ Service integration
- ✅ Status codes
- ✅ Error responses
- ✅ Request validation

---

## 🔗 Integration Tests

### **API Integration Tests** (`api.test.js`)

```javascript
describe('Recipe API Integration Tests', () => {
  describe('Complete Recipe Workflow', () => {
    test('should handle CRUD operations', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(201);

      // READ
      const readResponse = await request(app)
        .get(`/api/recipes/${createResponse.body.data.id}`)
        .expect(200);

      // UPDATE
      const updateResponse = await request(app)
        .put(`/api/recipes/${createResponse.body.data.id}`)
        .send(updateData)
        .expect(200);

      // DELETE
      await request(app)
        .delete(`/api/recipes/${createResponse.body.data.id}`)
        .expect(200);
    });
  });
});
```

**Test Coverage:**
- ✅ Complete CRUD workflow
- ✅ Middleware integration
- ✅ Error handling flow
- ✅ CORS functionality
- ✅ Request logging
- ✅ JSON parsing

---

## ✅ Best Practices

### **1. Test Organization**

```javascript
describe('ComponentName', () => {
  describe('methodName()', () => {
    test('should do something specific', () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = methodUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### **2. Mocking Strategy**

```javascript
// Mock external dependencies
jest.mock('../../src/config/db');
jest.mock('../../src/repositories/recipeRepository');

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

### **3. Test Data Management**

```javascript
// Use consistent test data
const mockRecipeData = {
  id: 1,
  title: 'Test Recipe',
  ingredients: ['ingredient1'],
  instructions: ['step1']
};

// Factory functions for test data
const createMockRecipe = (overrides = {}) => ({
  ...mockRecipeData,
  ...overrides
});
```

### **4. Async Testing**

```javascript
// Use async/await for async operations
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Handle rejected promises
test('should handle errors', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message');
});
```

### **5. Error Testing**

```javascript
test('should handle validation errors', async () => {
  const invalidData = { /* invalid data */ };
  
  await expect(service.create(invalidData))
    .rejects
    .toThrow('Validation errors:');
});
```

---

## 🎯 Test Examples

### **Running Specific Tests:**

```bash
# Run only Model tests
npm test -- recipeModel

# Run only Service tests  
npm test -- recipeService

# Run only tests matching "create"
npm test -- --testNamePattern="create"

# Run tests with verbose output
npm test -- --verbose

# Run tests and update snapshots
npm test -- --updateSnapshot
```

### **Coverage Analysis:**

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

---

## 🔧 Troubleshooting

### **Common Issues:**

#### 1. **Mock Issues**
```javascript
❌ Problem: "Cannot find module" errors

✅ Solution:
- Check mock path is correct
- Use jest.mock() at top of file
- Clear mocks between tests
```

#### 2. **Async Test Failures**
```javascript
❌ Problem: "Test timeout" or "Promise not resolved"

✅ Solution:
- Use async/await properly
- Add proper error handling
- Increase timeout if needed
```

#### 3. **Database Mock Issues**
```javascript
❌ Problem: "Database connection" errors in tests

✅ Solution:
- Mock db module in setup.js
- Reset mocks before each test
- Use proper mock return values
```

#### 4. **Coverage Issues**
```javascript
❌ Problem: "Coverage threshold not met"

✅ Solution:
- Add missing test cases
- Test error conditions
- Test edge cases
- Remove dead code
```

---

## 📚 Test Commands Reference

```bash
# Development Testing
npm test                    # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report

# Specific Testing
npm test -- --testPathPattern=unit     # Run only unit tests
npm test -- --testPathPattern=integration # Run only integration tests
npm test -- recipeModel               # Run specific test file

# Coverage and Reports
npm test -- --coverage --verbose      # Detailed coverage
npm test -- --passWithNoTests        # Don't fail if no tests
npm test -- --silent                 # Minimal output

# Debugging
npm test -- --runInBand              # Run tests serially
npm test -- --detectOpenHandles      # Detect async handles
npm test -- --forceExit             # Force exit after tests
```

---

## 🎯 Kesimpulan

Testing strategy Recipe API memberikan:

✅ **Comprehensive Coverage** - Unit + Integration tests
✅ **Reliable Mocking** - Database dan external dependencies  
✅ **Clear Organization** - Structured test files
✅ **Easy Commands** - Simple npm scripts
✅ **Detailed Reports** - Coverage analysis

**Test Philosophy:**
- Test behavior, not implementation
- Mock external dependencies
- Keep tests simple and focused
- Maintain high coverage
- Test error conditions

---

> **"Good tests are the foundation of maintainable code. Test early, test often, test everything."**

🧪 **Happy Testing!**
