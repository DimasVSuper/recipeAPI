# 🧪 Testing Documentation

## 📋 Overview

Proyek Recipe API dilengkapi dengan comprehensive test suite yang mencakup:
- **Unit Tests** - Testing individual components
- **Integration Tests** - Testing component interactions
- **Mocking** - Database dan service mocking
- **Coverage Reports** - Code coverage analysis

## 🏗️ Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── env.setup.js               # Environment variables for testing
├── unit/                      # Unit tests
│   ├── recipeModel.test.js    # Model layer tests
│   ├── recipeRepository.test.js # Repository layer tests
│   ├── recipeService.test.js   # Service layer tests
│   └── recipeController.test.js # Controller layer tests
└── integration/               # Integration tests
    └── api.test.js           # API endpoint integration tests
```

## 🎯 Test Coverage

### **Unit Tests (76 tests)**
- ✅ **Model Tests** - Data validation, transformation, schema
- ✅ **Repository Tests** - Database operations, Model integration
- ✅ **Service Tests** - Business logic, error handling
- ✅ **Controller Tests** - HTTP request/response handling

### **Integration Tests (4 tests)**
- ✅ **API Endpoints** - Complete CRUD workflow
- ✅ **Middleware Chain** - CORS, logging, error handling
- ✅ **Error Scenarios** - JSON parsing, validation errors
- ✅ **Health Check** - Application status endpoint

## 🚀 Running Tests

### **All Tests**
```bash
npm test
```

### **Unit Tests Only**
```bash
npm run test:unit
```

### **Integration Tests Only**
```bash
npm run test:integration
```

### **With Coverage**
```bash
npm run test:coverage
```

### **Watch Mode**
```bash
npm run test:watch
```

## 📊 Test Results Summary

```
✅ Test Suites: 5 passed
✅ Tests: 80 passed (76 unit + 4 integration)
✅ Coverage: High coverage across all layers
⏱️ Time: ~1.5s execution time
```

## 🔧 Test Configuration

### **Jest Configuration** (`jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  verbose: true
}
```

### **Environment Setup** (`tests/env.setup.js`)
```javascript
process.env.NODE_ENV = 'development';
process.env.DB_HOST = 'localhost';
// ... other test environment variables
```

## 🎭 Mocking Strategy

### **Database Mocking**
```javascript
jest.mock('../../src/config/db');
```

### **Service Layer Mocking**
```javascript
jest.mock('../../src/services/recipeService');
recipeService.getAllRecipes.mockResolvedValue(mockResponse);
```

### **Repository Mocking**
```javascript
jest.mock('../../src/repositories/recipeRepository');
recipeRepository.findAll.mockResolvedValue([mockRecipeModel]);
```

## 📋 Test Scenarios Covered

### **Model Layer**
- ✅ Constructor initialization
- ✅ Schema validation
- ✅ Required fields validation
- ✅ Business rules validation
- ✅ Data transformation (toJSON, toDatabase)
- ✅ Error handling

### **Repository Layer**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Model integration
- ✅ Database error handling
- ✅ Data validation
- ✅ JSON parsing/stringifying

### **Service Layer**
- ✅ Business logic validation
- ✅ Model coordination
- ✅ Error handling and propagation
- ✅ Response formatting
- ✅ ID validation
- ✅ Data transformation

### **Controller Layer**
- ✅ HTTP request handling
- ✅ Response status codes
- ✅ Error propagation to middleware
- ✅ Request body parsing
- ✅ Parameter validation

### **Integration Tests**
- ✅ Complete CRUD workflow
- ✅ Middleware execution order
- ✅ CORS headers
- ✅ Error handling middleware
- ✅ JSON parsing errors
- ✅ Request logging
- ✅ Health check endpoint

## 🛠️ Test Utilities

### **Mock Data Factory**
```javascript
const createMockRecipe = (overrides = {}) => ({
  id: 1,
  title: 'Test Recipe',
  description: 'Test description',
  ingredients: ['ingredient1'],
  instructions: ['step1'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});
```

### **Test App Factory**
```javascript
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  // ... middleware setup
  return app;
};
```

## 🔍 Debugging Tests

### **Common Issues & Solutions**

#### 1. **Mock Not Working**
```javascript
// Problem: Mock not being applied
// Solution: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 2. **Async Test Failures**
```javascript
// Problem: Async operations not awaited
// Solution: Use async/await properly
test('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

#### 3. **Environment Variables**
```javascript
// Problem: ENV vars not set
// Solution: Use env.setup.js
process.env.NODE_ENV = 'development';
```

## 📈 Coverage Reports

### **Coverage Thresholds**
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

### **Coverage Output**
```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|--------
All files                 |   95.2  |   87.5   |   96.3  |   94.8
 src/controllers         |   100   |   100    |   100   |   100
 src/models              |   100   |   85.7    |   100   |   100
 src/repositories        |   93.8  |   83.3    |   100   |   93.5
 src/services            |   91.3  |   87.5    |   87.5  |   90.9
```

## 🚨 Continuous Integration

### **GitHub Actions** (Future Enhancement)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## ✅ Best Practices

### **Test Organization**
- Group related tests with `describe()`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up after each test

### **Mocking**
- Mock external dependencies
- Use proper mock lifecycle management
- Reset mocks between tests
- Mock at the right level

### **Assertions**
- Use specific matchers
- Test both success and failure cases
- Verify mock calls
- Check response structures

### **Performance**
- Keep tests fast (< 5s total)
- Use proper setup/teardown
- Avoid unnecessary database operations
- Parallel test execution

---

## 🎯 Next Steps

- [ ] Add E2E tests with real database
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing
- [ ] Visual regression testing

---

> **"Testing is not just about finding bugs, it's about building confidence in your code."**

🚀 **Happy Testing!**
