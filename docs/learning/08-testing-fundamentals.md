# 🧪 Testing Fundamentals dalam Layered Architecture

> **Memahami Testing Strategy untuk Setiap Layer**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Mengapa testing penting dalam layered architecture
- ✅ Jenis-jenis testing dan kapan menggunakannya
- ✅ Strategy testing untuk setiap layer
- ✅ Tools dan best practices testing

## 🏗️ Testing Pyramid untuk Layered Architecture

```
                    🔺
                   /   \
                  /  E2E \
                 /  Tests \    <- Few, Slow, Expensive
                /---------\
               /           \
              / Integration \
             /    Tests     \  <- Some, Medium Speed
            /---------------\
           /                 \
          /   Unit Tests      \
         /                   \ <- Many, Fast, Cheap
        /---------------------\
       🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
```

### **Unit Tests (70%)**
- Test individual functions/methods
- Fast execution
- Easy to debug
- High coverage

### **Integration Tests (20%)**  
- Test interaction between layers
- Medium speed
- Test data flow
- Real dependencies

### **E2E Tests (10%)**
- Test complete user scenarios
- Slow execution
- High confidence
- Expensive to maintain

## 🧪 Testing Strategy per Layer

### 1. **🎛️ Controller Layer Testing**

#### **Focus Areas:**
- HTTP request/response handling
- Status codes
- Input validation
- Error responses

#### **Example Test:**
```javascript
// tests/unit/recipeController.test.js
describe('RecipeController', () => {
  describe('GET /recipes', () => {
    it('should return all recipes successfully', async () => {
      // ARRANGE
      const mockRecipes = [
        { id: 1, title: 'Test Recipe' }
      ];
      const mockService = {
        getAllRecipes: jest.fn().mockResolvedValue({
          success: true,
          data: mockRecipes
        })
      };

      // ACT
      const controller = new RecipeController(mockService);
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await controller.getAllRecipes(req, res);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecipes
      });
    });
  });
});
```

#### **What to Mock:**
- ✅ Service layer methods
- ✅ Express req/res objects
- ❌ Don't mock controller logic itself

### 2. **⚙️ Service Layer Testing**

#### **Focus Areas:**
- Business logic validation
- Data transformation
- Error handling
- Business rules

#### **Example Test:**
```javascript
// tests/unit/recipeService.test.js
describe('RecipeService', () => {
  describe('createRecipe()', () => {
    it('should create recipe with valid data', async () => {
      // ARRANGE
      const mockRepository = {
        create: jest.fn().mockResolvedValue(mockRecipeModel)
      };
      const service = new RecipeService(mockRepository);
      
      const validData = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      // ACT
      const result = await service.createRecipe(validData);

      // ASSERT
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(validData)
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw validation error for invalid data', async () => {
      // ARRANGE
      const service = new RecipeService();
      const invalidData = { title: '' }; // Empty title

      // ACT & ASSERT
      await expect(service.createRecipe(invalidData))
        .rejects
        .toThrow('Validation failed');
    });
  });
});
```

#### **What to Mock:**
- ✅ Repository layer methods
- ✅ External API calls
- ❌ Don't mock business logic

### 3. **🗃️ Repository Layer Testing**

#### **Focus Areas:**
- Database operations
- Data mapping
- Query correctness
- Error handling

#### **Example Test:**
```javascript
// tests/unit/recipeRepository.test.js
describe('RecipeRepository', () => {
  describe('findAll()', () => {
    it('should return array of RecipeModel instances', async () => {
      // ARRANGE
      const mockDbRows = [
        { id: 1, title: 'Recipe 1', ingredients: '["ing1"]' }
      ];
      
      const mockDb = {
        query: jest.fn().mockResolvedValue([mockDbRows])
      };
      
      const repository = new RecipeRepository(mockDb);

      // ACT
      const result = await repository.findAll();

      // ASSERT
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM recipes ORDER BY created_at DESC'
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RecipeModel);
    });
  });
});
```

#### **What to Mock:**
- ✅ Database connection
- ✅ Database query results
- ❌ Don't mock data mapping logic

### 4. **📋 Model Layer Testing**

#### **Focus Areas:**
- Data validation
- Data transformation
- Business entity behavior
- Schema compliance

#### **Example Test:**
```javascript
// tests/unit/recipeModel.test.js
describe('RecipeModel', () => {
  describe('validate()', () => {
    it('should return no errors for valid data', () => {
      // ARRANGE
      const validData = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      // ACT
      const recipe = new RecipeModel(validData);
      const errors = recipe.validate();

      // ASSERT
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing title', () => {
      // ARRANGE
      const invalidData = {
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      // ACT
      const recipe = new RecipeModel(invalidData);
      const errors = recipe.validate();

      // ASSERT
      expect(errors).toContain('Title is required');
    });
  });

  describe('toJSON()', () => {
    it('should return proper JSON representation', () => {
      // ARRANGE
      const recipe = new RecipeModel({
        id: 1,
        title: 'Test Recipe'
      });

      // ACT
      const json = recipe.toJSON();

      // ASSERT
      expect(json).toEqual({
        id: 1,
        title: 'Test Recipe',
        // ... other expected fields
      });
    });
  });
});
```

#### **What to Mock:**
- ✅ External dependencies (if any)
- ❌ Don't mock model methods themselves

## 🌐 Integration Testing

### **Testing Layer Interactions**

```javascript
// tests/integration/api.test.js
describe('Recipe API Integration', () => {
  it('should handle complete recipe workflow', async () => {
    // Test real flow through all layers
    const response = await request(app)
      .post('/api/recipes')
      .send({
        title: 'Integration Test Recipe',
        ingredients: ['test ingredient'],
        instructions: ['test step']
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Integration Test Recipe');
  });
});
```

### **What Integration Tests Cover:**
- ✅ Layer communication
- ✅ Data flow validation
- ✅ Error propagation
- ✅ Middleware functionality
- ✅ Response formatting

## 🛠️ Testing Tools & Setup

### **Dependencies:**
```json
{
  "devDependencies": {
    "jest": "^30.0.3",
    "supertest": "^7.1.1"
  }
}
```

### **Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### **Test Setup:**
```javascript
// tests/setup.js
// Global test configuration
process.env.NODE_ENV = 'test';

// Mock database for tests
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));
```

## 📊 Coverage Goals per Layer

### **Target Coverage:**

| Layer | Lines | Branches | Functions |
|-------|-------|----------|-----------|
| Controller | 90%+ | 85%+ | 100% |
| Service | 95%+ | 90%+ | 100% |
| Repository | 85%+ | 80%+ | 100% |
| Model | 95%+ | 90%+ | 100% |
| **Overall** | **88%+** | **85%+** | **100%** |

### **Current Project Stats:**
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   88.07 |    79.67 |     100 |   88.03 |
Controllers           |     100 |      100 |     100 |     100 |
Services              |   98.27 |     97.5 |     100 |   98.24 |
Repositories          |     100 |    82.35 |     100 |     100 |
Models                |     100 |    97.36 |     100 |     100 |
----------------------|---------|----------|---------|---------|
```

## 🎯 Testing Best Practices

### **1. AAA Pattern**
```javascript
it('should do something', () => {
  // ARRANGE - Setup test data
  const input = 'test';
  
  // ACT - Execute the function
  const result = functionUnderTest(input);
  
  // ASSERT - Verify the result
  expect(result).toBe('expected');
});
```

### **2. Descriptive Test Names**
```javascript
// ❌ Bad
it('tests recipe creation', () => {});

// ✅ Good
it('should create recipe when valid data provided', () => {});
it('should throw validation error when title is empty', () => {});
```

### **3. Test One Thing**
```javascript
// ❌ Bad - Testing multiple things
it('should handle recipe operations', () => {
  // Test creation
  // Test validation
  // Test update
  // Test deletion
});

// ✅ Good - One responsibility per test
it('should create recipe with valid data', () => {});
it('should validate required fields', () => {});
```

### **4. Mock External Dependencies**
```javascript
// ✅ Mock database
const mockDb = {
  query: jest.fn().mockResolvedValue([])
};

// ✅ Mock external APIs
const mockApiClient = {
  post: jest.fn().mockResolvedValue({ success: true })
};
```

### **5. Test Error Scenarios**
```javascript
describe('Error Handling', () => {
  it('should handle database connection error', async () => {
    mockDb.query.mockRejectedValue(new Error('Connection failed'));
    
    await expect(repository.findAll())
      .rejects
      .toThrow('Connection failed');
  });
});
```

## 🏋️‍♂️ Exercise

### **Exercise 1: Write Controller Test**
Buat test untuk `updateRecipe` controller method:
- Test successful update
- Test validation error
- Test recipe not found error

### **Exercise 2: Write Service Test**
Buat test untuk `deleteRecipe` service method:
- Test successful deletion
- Test invalid ID
- Test recipe not found

### **Exercise 3: Integration Test**
Buat integration test untuk:
- GET all recipes
- GET recipe by ID
- Error handling middleware

## 📚 Further Reading

- [🔍 Unit Testing Deep Dive](09-unit-testing.md)
- [🌐 Integration Testing Guide](10-integration-testing.md)
- [✅ Testing Best Practices](11-best-practices.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Unit Testing →](09-unit-testing.md)**

---

*💡 **Tip**: Jalankan `npm run test:coverage` untuk melihat coverage report real-time!*
