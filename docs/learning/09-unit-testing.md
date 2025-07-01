# 09 - Unit Testing Deep Dive

> **Chapter 9: Mastering Unit Testing - Isolation, Mocking & Test-Driven Development**

## 📋 Chapter Overview

Unit Testing adalah **testing individual components** dalam isolasi. Unit test yang baik adalah:
- **Fast** - Dijalankan dalam milidetik
- **Independent** - Tidak bergantung pada external systems
- **Repeatable** - Hasil konsisten di environment manapun
- **Self-Validating** - Clear pass/fail dengan assertion
- **Timely** - Ditulis bersamaan dengan production code

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Memahami prinsip unit testing yang efektif
- ✅ Menguasai mocking dan stubbing techniques
- ✅ Menulis test cases yang comprehensive
- ✅ Implementasi test-driven development (TDD)
- ✅ Achieve high code coverage dengan meaningful tests
- ✅ Debug dan troubleshoot failing tests

## 🏗️ Unit Testing Architecture

### **Testing Pyramid**
```
       🔺 E2E Tests
      🔸🔸 Integration Tests  
   🔹🔹🔹🔹 Unit Tests
```

**Unit Tests = Foundation** - Majority of your tests should be unit tests

### **Test Isolation Levels**
```
┌─────────────────┐
│   🧪 Unit Test  │ ← Test single function/method
├─────────────────┤
│   📦 Module     │ ← Test exported functions
├─────────────────┤
│   🏛️  Class      │ ← Test class methods
├─────────────────┤
│   🔧 Component  │ ← Test small component
└─────────────────┘
```

## 🔍 Real Unit Test Analysis

Mari kita analyze unit tests di project ini:

### **1. Model Unit Tests**
```javascript
// tests/unit/recipeModel.test.js - Real Implementation
const RecipeModel = require('../../src/models/recipeModel');

describe('RecipeModel', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const recipe = new RecipeModel();
      
      expect(recipe.id).toBeNull();
      expect(recipe.title).toBe('');
      expect(recipe.description).toBeNull();
      expect(recipe.ingredients).toEqual([]);
      expect(recipe.instructions).toEqual([]);
    });

    test('should create instance with provided data', () => {
      const data = {
        id: 1,
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };
      
      const recipe = new RecipeModel(data);
      
      expect(recipe.id).toBe(1);
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.description).toBe('Test Description');
      expect(recipe.ingredients).toEqual(['ingredient1', 'ingredient2']);
      expect(recipe.instructions).toEqual(['step1', 'step2']);
    });
  });

  describe('Validation', () => {
    test('should return errors for missing required fields', () => {
      const recipe = new RecipeModel({});
      const errors = recipe.validate();
      
      expect(errors).toContain('title is required');
      expect(errors).toContain('ingredients is required');
      expect(errors).toContain('instructions is required');
    });

    test('should validate title length', () => {
      const recipe = new RecipeModel({
        title: 'Hi',  // Too short
        ingredients: ['salt'],
        instructions: ['cook']
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

    test('should pass validation with valid data', () => {
      const recipe = new RecipeModel({
        title: 'Valid Recipe Title',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      });
      
      const errors = recipe.validate();
      expect(errors).toEqual([]);
    });
  });

  describe('Transformation Methods', () => {
    test('toJSON should return clean object', () => {
      const recipe = new RecipeModel({
        id: 1,
        title: 'Test Recipe',
        ingredients: ['salt'],
        instructions: ['cook']
      });
      
      const json = recipe.toJSON();
      
      expect(json).toEqual({
        id: 1,
        title: 'Test Recipe',
        description: null,
        ingredients: ['salt'],
        instructions: ['cook'],
        created_at: null,
        updated_at: null
      });
    });

    test('toDatabase should trim strings and handle nulls', () => {
      const recipe = new RecipeModel({
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
        ingredients: ['salt'],
        instructions: ['cook']
      });
      
      const dbData = recipe.toDatabase();
      
      expect(dbData.title).toBe('Trimmed Title');
      expect(dbData.description).toBe('Trimmed Description');
    });
  });
});
```

### **2. Repository Unit Tests dengan Mocking**
```javascript
// tests/unit/recipeRepository.test.js - Real Implementation
const RecipeRepository = require('../../src/repositories/recipeRepository');
const RecipeModel = require('../../src/models/recipeModel');

// Mock database
const mockDb = {
  query: jest.fn(),
  execute: jest.fn()
};

describe('RecipeRepository', () => {
  let recipeRepository;
  
  beforeEach(() => {
    recipeRepository = new RecipeRepository(mockDb);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    test('should return array of RecipeModel instances', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Recipe 1',
          description: 'Description 1',
          ingredients: JSON.stringify(['ingredient1']),
          instructions: JSON.stringify(['step1']),
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ];
      
      mockDb.query.mockResolvedValue([mockRows]);
      
      const result = await recipeRepository.findAll();
      
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM recipes ORDER BY created_at DESC');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RecipeModel);
      expect(result[0].title).toBe('Recipe 1');
    });

    test('should handle empty result', async () => {
      mockDb.query.mockResolvedValue([[]]);
      
      const result = await recipeRepository.findAll();
      
      expect(result).toEqual([]);
    });

    test('should handle database error', async () => {
      const error = new Error('Database connection failed');
      mockDb.query.mockRejectedValue(error);
      
      await expect(recipeRepository.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('create', () => {
    test('should create recipe and return RecipeModel instance', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'New Description',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      const mockResult = { insertId: 123 };
      mockDb.query.mockResolvedValue([mockResult]);
      
      const result = await recipeRepository.create(recipeData);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
        ['New Recipe', 'New Description', '["ingredient1"]', '["step1"]']
      );
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.id).toBe(123);
      expect(result.title).toBe('New Recipe');
    });

    test('should validate data before creating', async () => {
      const invalidData = { title: '' }; // Invalid data
      
      await expect(recipeRepository.create(invalidData)).rejects.toThrow('Validation failed');
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });
});
```

### **3. Service Unit Tests dengan Comprehensive Mocking**
```javascript
// tests/unit/recipeService.test.js - Real Implementation
const RecipeService = require('../../src/services/recipeService');
const RecipeModel = require('../../src/models/recipeModel');

// Mock repository
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('RecipeService', () => {
  let recipeService;
  
  beforeEach(() => {
    recipeService = new RecipeService(mockRepository);
    jest.clearAllMocks();
  });

  describe('getAllRecipes', () => {
    test('should return formatted recipes', async () => {
      const mockRecipes = [
        new RecipeModel({
          id: 1,
          title: 'Recipe 1',
          ingredients: ['ingredient1'],
          instructions: ['step1']
        })
      ];
      
      mockRepository.findAll.mockResolvedValue(mockRecipes);
      
      const result = await recipeService.getAllRecipes();
      
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockRecipes[0].toJSON());
    });

    test('should handle repository errors', async () => {
      const error = new Error('Repository error');
      mockRepository.findAll.mockRejectedValue(error);
      
      await expect(recipeService.getAllRecipes()).rejects.toThrow('Repository error');
    });
  });

  describe('createRecipe', () => {
    test('should validate and create recipe', async () => {
      const recipeData = {
        title: 'New Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      const mockCreatedRecipe = new RecipeModel({
        id: 1,
        ...recipeData
      });
      
      mockRepository.create.mockResolvedValue(mockCreatedRecipe);
      
      const result = await recipeService.createRecipe(recipeData);
      
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedRecipe.toJSON());
    });

    test('should reject invalid data', async () => {
      const invalidData = { title: '' }; // Invalid
      
      await expect(recipeService.createRecipe(invalidData)).rejects.toThrow('Validation failed');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

## 📊 Advanced Unit Testing Patterns

### **1. Test Data Builders (Test Object Mother)**
```javascript
// tests/helpers/testDataBuilder.js
class RecipeTestBuilder {
  constructor() {
    this.data = {
      title: 'Test Recipe',
      description: 'Test Description',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: ['step1', 'step2']
    };
  }

  withTitle(title) {
    this.data.title = title;
    return this;
  }

  withInvalidTitle() {
    this.data.title = '';
    return this;
  }

  withId(id) {
    this.data.id = id;
    return this;
  }

  withoutIngredients() {
    this.data.ingredients = [];
    return this;
  }

  build() {
    return new RecipeModel(this.data);
  }

  buildData() {
    return { ...this.data };
  }
}

// Usage in tests
test('should validate title', () => {
  const recipe = new RecipeTestBuilder()
    .withInvalidTitle()
    .build();
    
  const errors = recipe.validate();
  expect(errors).toContain('title is required');
});
```

### **2. Custom Jest Matchers**
```javascript
// tests/helpers/customMatchers.js
expect.extend({
  toBeValidRecipe(received) {
    const errors = received.validate();
    const pass = errors.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected recipe to be invalid, but it was valid`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected recipe to be valid, but got errors: ${errors.join(', ')}`,
        pass: false
      };
    }
  },

  toHaveValidationError(received, expectedError) {
    const errors = received.validate();
    const pass = errors.includes(expectedError);
    
    if (pass) {
      return {
        message: () => `Expected recipe not to have error "${expectedError}"`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected recipe to have error "${expectedError}", but got: ${errors.join(', ')}`,
        pass: false
      };
    }
  }
});

// Usage
test('should be valid recipe', () => {
  const recipe = new RecipeTestBuilder().build();
  expect(recipe).toBeValidRecipe();
});

test('should have specific validation error', () => {
  const recipe = new RecipeTestBuilder().withInvalidTitle().build();
  expect(recipe).toHaveValidationError('title is required');
});
```

### **3. Parameterized Tests**
```javascript
// tests/unit/recipeValidation.test.js
describe('Recipe Title Validation', () => {
  const testCases = [
    { title: '', expected: 'title is required' },
    { title: 'Hi', expected: 'Title must be at least 3 characters' },
    { title: 'Valid Title', expected: null },
    { title: '   ', expected: 'title is required' },
    { title: 'A'.repeat(201), expected: 'Title must not exceed 200 characters' }
  ];

  test.each(testCases)('title "$title" should validate correctly', ({ title, expected }) => {
    const recipe = new RecipeModel({
      title,
      ingredients: ['ingredient1'],
      instructions: ['step1']
    });
    
    const errors = recipe.validate();
    
    if (expected) {
      expect(errors).toContain(expected);
    } else {
      expect(errors).toEqual([]);
    }
  });
});
```

### **4. Async/Await Testing Patterns**
```javascript
describe('Async Operations', () => {
  test('should handle async success', async () => {
    mockRepository.findById.mockResolvedValue(new RecipeModel({ id: 1 }));
    
    const result = await recipeService.getRecipeById(1);
    
    expect(result).toBeDefined();
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });

  test('should handle async rejection', async () => {
    const error = new Error('Not found');
    mockRepository.findById.mockRejectedValue(error);
    
    await expect(recipeService.getRecipeById(999)).rejects.toThrow('Not found');
  });

  test('should handle promise chain', async () => {
    mockRepository.create
      .mockImplementationOnce(() => Promise.resolve(new RecipeModel({ id: 1 })))
      .mockImplementationOnce(() => Promise.reject(new Error('Duplicate')));
    
    // First call succeeds
    await expect(recipeService.createRecipe(validData)).resolves.toBeDefined();
    
    // Second call fails
    await expect(recipeService.createRecipe(validData)).rejects.toThrow('Duplicate');
  });
});
```

## 🎯 Mock Strategies & Best Practices

### **1. Manual Mocks**
```javascript
// __mocks__/database.js
module.exports = {
  query: jest.fn(),
  execute: jest.fn(),
  close: jest.fn()
};
```

### **2. Spy on Real Methods**
```javascript
test('should call real method with spy', () => {
  const realObject = new RealClass();
  const spy = jest.spyOn(realObject, 'methodName');
  
  realObject.methodName('arg1', 'arg2');
  
  expect(spy).toHaveBeenCalledWith('arg1', 'arg2');
  expect(spy).toHaveBeenCalledTimes(1);
  
  spy.mockRestore(); // Restore original implementation
});
```

### **3. Mock Implementation Variations**
```javascript
test('should mock with different implementations', () => {
  // Mock return value
  mockFn.mockReturnValue('static value');
  
  // Mock resolved promise
  mockFn.mockResolvedValue({ data: 'success' });
  
  // Mock rejected promise
  mockFn.mockRejectedValue(new Error('failure'));
  
  // Mock implementation
  mockFn.mockImplementation((arg) => {
    if (arg === 'special') return 'special response';
    return 'default response';
  });
  
  // Mock implementation once
  mockFn
    .mockImplementationOnce(() => 'first call')
    .mockImplementationOnce(() => 'second call')
    .mockImplementation(() => 'subsequent calls');
});
```

### **4. Dependency Injection for Testing**
```javascript
// ✅ GOOD: Constructor injection untuk testing
class RecipeService {
  constructor(repository = new RecipeRepository()) {
    this.repository = repository;
  }
  
  async getAllRecipes() {
    const recipes = await this.repository.findAll();
    return recipes.map(recipe => recipe.toJSON());
  }
}

// Easy to test dengan mock repository
test('should get all recipes', async () => {
  const mockRepo = { findAll: jest.fn().mockResolvedValue([]) };
  const service = new RecipeService(mockRepo);
  
  await service.getAllRecipes();
  
  expect(mockRepo.findAll).toHaveBeenCalled();
});
```

## 🧪 Test-Driven Development (TDD)

### **TDD Cycle: Red-Green-Refactor**
```javascript
// 1. RED: Write failing test first
test('should calculate recipe cooking time', () => {
  const recipe = new RecipeModel({
    title: 'Quick Recipe',
    prepTime: 10,
    cookTime: 15
  });
  
  expect(recipe.getTotalTime()).toBe(25); // This will fail initially
});

// 2. GREEN: Write minimal code to pass
class RecipeModel {
  getTotalTime() {
    return (this.prepTime || 0) + (this.cookTime || 0);
  }
}

// 3. REFACTOR: Improve code while keeping tests green
class RecipeModel {
  getTotalTime() {
    const prep = this.prepTime || 0;
    const cook = this.cookTime || 0;
    
    if (prep < 0 || cook < 0) {
      throw new Error('Time values must be positive');
    }
    
    return prep + cook;
  }
}
```

### **TDD Example: Adding New Feature**
```javascript
// Step 1: Write test for new feature
describe('Recipe difficulty calculation', () => {
  test('should calculate difficulty based on time and ingredients', () => {
    const easyRecipe = new RecipeModel({
      title: 'Easy Recipe',
      prepTime: 5,
      cookTime: 10,
      ingredients: ['salt', 'pepper']
    });
    
    expect(easyRecipe.getDifficulty()).toBe('easy');
  });

  test('should return medium for moderate complexity', () => {
    const mediumRecipe = new RecipeModel({
      title: 'Medium Recipe',
      prepTime: 15,
      cookTime: 30,
      ingredients: ['flour', 'eggs', 'milk', 'butter', 'sugar']
    });
    
    expect(mediumRecipe.getDifficulty()).toBe('medium');
  });
});

// Step 2: Implement feature
class RecipeModel {
  getDifficulty() {
    const totalTime = this.getTotalTime();
    const ingredientCount = this.ingredients?.length || 0;
    
    if (totalTime <= 20 && ingredientCount <= 3) {
      return 'easy';
    } else if (totalTime <= 60 && ingredientCount <= 8) {
      return 'medium';
    } else {
      return 'hard';
    }
  }
}
```

## 📊 Code Coverage & Quality Metrics

### **Understanding Coverage Types**
```javascript
// Function Coverage: Are all functions called?
function calculateTotal(a, b) {  // ✅ Called in test
  return a + b;
}

function deprecatedFunction() {  // ❌ Never called
  return 'old logic';
}

// Branch Coverage: Are all conditional paths tested?
function validateAge(age) {
  if (age < 0) {        // ✅ Tested
    return 'invalid';
  } else if (age < 18) { // ✅ Tested  
    return 'minor';
  } else {               // ❌ Not tested
    return 'adult';
  }
}

// Line Coverage: Are all lines executed?
function processData(data) {
  const result = [];           // ✅ Executed
  
  if (data.length > 0) {       // ✅ Executed
    result.push('processed');  // ✅ Executed
  }
  
  console.log('debug info');   // ❌ Not executed in test
  return result;
}
```

### **Meaningful Coverage Example**
```javascript
// tests/unit/recipeCalculations.test.js
describe('Recipe Calculations', () => {
  describe('getTotalTime', () => {
    test('should add prep and cook time', () => {
      const recipe = new RecipeModel({ prepTime: 10, cookTime: 15 });
      expect(recipe.getTotalTime()).toBe(25);
    });

    test('should handle missing prep time', () => {
      const recipe = new RecipeModel({ cookTime: 15 });
      expect(recipe.getTotalTime()).toBe(15);
    });

    test('should handle missing cook time', () => {
      const recipe = new RecipeModel({ prepTime: 10 });
      expect(recipe.getTotalTime()).toBe(10);
    });

    test('should handle both times missing', () => {
      const recipe = new RecipeModel({});
      expect(recipe.getTotalTime()).toBe(0);
    });

    test('should throw error for negative times', () => {
      const recipe = new RecipeModel({ prepTime: -5, cookTime: 10 });
      expect(() => recipe.getTotalTime()).toThrow('Time values must be positive');
    });
  });
});

// This gives us:
// ✅ 100% Function Coverage (getTotalTime called)
// ✅ 100% Branch Coverage (all if/else paths tested)  
// ✅ 100% Line Coverage (all lines executed)
// ✅ Edge Cases Covered (missing values, errors)
```

## 🚨 Common Unit Testing Pitfalls

### **❌ Pitfall 1: Testing Implementation Details**
```javascript
// BAD: Testing internal state
test('should set internal flag', () => {
  const service = new RecipeService();
  service.processRecipe(data);
  
  expect(service._internalFlag).toBe(true); // ❌ Implementation detail
});
```

**✅ Solution: Test behavior, not implementation**
```javascript
// GOOD: Testing observable behavior
test('should return processed recipe', () => {
  const service = new RecipeService();
  const result = service.processRecipe(data);
  
  expect(result).toEqual(expectedOutput); // ✅ Public interface
});
```

### **❌ Pitfall 2: Over-mocking**
```javascript
// BAD: Mocking everything
test('should format recipe title', () => {
  const mockString = jest.fn().mockReturnValue('FORMATTED');
  String.prototype.toUpperCase = mockString;
  
  const result = formatRecipeTitle('test');
  
  expect(mockString).toHaveBeenCalled();
});
```

**✅ Solution: Mock only external dependencies**
```javascript
// GOOD: Testing real logic, mocking external deps
test('should format recipe title', () => {
  const result = formatRecipeTitle('test recipe');
  
  expect(result).toBe('Test Recipe'); // Test actual logic
});
```

### **❌ Pitfall 3: Flaky Tests**
```javascript
// BAD: Date-dependent test
test('should set creation date', () => {
  const recipe = new RecipeModel();
  recipe.setCreatedDate();
  
  expect(recipe.created_at).toBe(new Date().toISOString()); // ❌ Timing issues
});
```

**✅ Solution: Control time in tests**
```javascript
// GOOD: Mock date for consistent results
test('should set creation date', () => {
  const fixedDate = new Date('2023-01-01T10:00:00Z');
  jest.useFakeTimers();
  jest.setSystemTime(fixedDate);
  
  const recipe = new RecipeModel();
  recipe.setCreatedDate();
  
  expect(recipe.created_at).toBe(fixedDate.toISOString());
  
  jest.useRealTimers();
});
```

## 📝 Hands-on Exercises

### **Exercise 1: Write Complete Unit Tests**
```javascript
// exercises/userModel.test.js
class UserModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.password = data.password || '';
  }

  validate() {
    // TODO: Implement validation
  }

  hashPassword() {
    // TODO: Implement password hashing
  }
}

// TODO: Write comprehensive unit tests
// - Test constructor with various inputs
// - Test validation rules
// - Test password hashing
// - Test edge cases
```

### **Exercise 2: Mock External Dependencies**
```javascript
// exercises/emailService.test.js
class EmailService {
  constructor(emailProvider, logger) {
    this.emailProvider = emailProvider;
    this.logger = logger;
  }

  async sendWelcomeEmail(user) {
    // TODO: Implement email sending with error handling
  }
}

// TODO: Write tests with mocks
// - Mock emailProvider
// - Mock logger
// - Test success case
// - Test error handling
```

### **Exercise 3: TDD Feature Implementation**
```javascript
// exercises/recipeRating.test.js
// TODO: Implement recipe rating feature using TDD
// 1. Write failing tests first
// 2. Implement minimal code to pass
// 3. Refactor while keeping tests green

// Features to implement:
// - Add rating to recipe (1-5 stars)
// - Calculate average rating
// - Validate rating values
// - Handle edge cases
```

## 🎯 Best Practices Summary

### **✅ DO**
- **Test Behavior**: Focus on what the code does, not how
- **One Assertion**: Test one thing at a time
- **Clear Names**: Test names should describe the scenario
- **Arrange-Act-Assert**: Structure tests clearly
- **Mock Sparingly**: Only mock external dependencies

### **❌ DON'T**
- **Test Implementation**: Avoid testing private methods
- **Complex Setup**: Keep test setup simple
- **Shared State**: Tests should be independent
- **Magic Numbers**: Use meaningful test data
- **Ignore Failures**: Fix failing tests immediately

## 🚀 Next Steps

Setelah menguasai Unit Testing:

1. **[🔗 Integration Testing →](10-integration-testing.md)** - Test component interactions
2. **[⚡ Best Practices →](11-best-practices.md)** - Production patterns
3. **[🚨 Common Pitfalls →](12-common-pitfalls.md)** - Avoid mistakes

---

## 💡 Key Takeaways

- **Unit Tests = Fast, Independent, Reliable**
- **Mock external dependencies** but test real logic
- **TDD helps design** better APIs and interfaces
- **High coverage ≠ Good tests** - focus on meaningful scenarios
- **Test behavior, not implementation** details

**Next Chapter: [10 - Integration Testing →](10-integration-testing.md)**
