# ⚙️ Service Layer Deep Dive

> **Menguasai Business Logic dan Orchestration**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Peran sentral Service Layer dalam arsitektur
- ✅ Cara mengimplementasikan business logic dengan clean
- ✅ Data validation dan transformation patterns
- ✅ Error handling dan business rules enforcement
- ✅ Integration dengan Repository layer

## 🤔 Apa itu Service Layer?

**Service Layer** adalah **jantung** dari business logic aplikasi. Layer ini bertanggung jawab untuk mengimplementasikan **aturan bisnis**, **validasi data**, dan **orchestration** antara berbagai repository.

### 📊 Service dalam Arsitektur

```
🎛️ CONTROLLER LAYER
       ⬇️
⚙️ SERVICE LAYER        ← You are here!
       ⬇️
🗃️ REPOSITORY LAYER
       ⬇️
💾 DATABASE
```

## 🔍 Tanggung Jawab Service Layer

### ✅ **Primary Responsibilities**

1. **🧠 Business Logic Implementation**
   ```javascript
   async createRecipe(recipeData) {
     // Business rules: Title must be unique
     // Validation: Required fields
     // Transformation: Clean and format data
   }
   ```

2. **✅ Data Validation & Sanitization**
   ```javascript
   // Validate using Model
   const recipe = new RecipeModel(recipeData);
   const errors = recipe.validate();
   
   if (errors.length > 0) {
     throw new Error(`Validation failed: ${errors.join(', ')}`);
   }
   ```

3. **🔄 Repository Orchestration**
   ```javascript
   // Coordinate multiple repositories
   const user = await this.userRepository.findById(userId);
   const recipe = await this.recipeRepository.create(recipeData);
   await this.notificationService.sendNewRecipeNotification(user, recipe);
   ```

4. **📝 Data Transformation**
   ```javascript
   // Transform data between layers
   const formattedRecipe = recipe.toJSON();
   return {
     success: true,
     message: 'Recipe created successfully',
     data: formattedRecipe
   };
   ```

5. **🛡️ Business Rules Enforcement**
   ```javascript
   // Enforce business constraints
   if (user.role !== 'chef' && recipe.ingredients.length > 10) {
     throw new Error('Non-chef users cannot create recipes with more than 10 ingredients');
   }
   ```

## 🧩 Anatomy of Recipe Service

### **File Structure:**
```javascript
// src/services/recipeService.js
class RecipeService {
  constructor(recipeRepository) {
    this.recipeRepository = recipeRepository;
  }

  // CRUD Operations
  async getAllRecipes(options = {}) { /* ... */ }
  async getRecipeById(id) { /* ... */ }
  async createRecipe(recipeData) { /* ... */ }
  async updateRecipe(id, updateData) { /* ... */ }
  async deleteRecipe(id) { /* ... */ }

  // Business Logic Methods
  async validateRecipeData(data) { /* ... */ }
  async searchRecipes(query) { /* ... */ }
  async getPopularRecipes() { /* ... */ }
}
```

### **Detailed Implementation:**

#### 1. **Get All Recipes**
```javascript
async getAllRecipes(options = {}) {
  try {
    // 1. Extract and validate options
    const { page = 1, limit = 10, search, sortBy = 'created_at' } = options;
    
    // 2. Business logic: pagination limits
    const maxLimit = 100;
    const safeLimit = Math.min(limit, maxLimit);
    
    // 3. Call repository with processed options
    const recipes = await this.recipeRepository.findAll({
      page,
      limit: safeLimit,
      search,
      sortBy
    });
    
    // 4. Transform data using Model
    const formattedRecipes = recipes.map(recipe => recipe.toJSON());
    
    // 5. Return formatted response
    return {
      success: true,
      message: 'Recipes retrieved successfully',
      data: formattedRecipes,
      meta: {
        page,
        limit: safeLimit,
        total: formattedRecipes.length
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to get recipes: ${error.message}`);
  }
}
```

#### 2. **Get Recipe by ID**
```javascript
async getRecipeById(id) {
  try {
    // 1. Validate input
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }
    
    // 2. Call repository
    const recipe = await this.recipeRepository.findById(parseInt(id));
    
    // 3. Business rule: check if recipe exists
    if (!recipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    
    // 4. Transform and return
    return {
      success: true,
      message: 'Recipe retrieved successfully',
      data: recipe.toJSON()
    };
    
  } catch (error) {
    throw new Error(`Failed to get recipe: ${error.message}`);
  }
}
```

#### 3. **Create Recipe** (Complex Business Logic)
```javascript
async createRecipe(recipeData) {
  try {
    // 1. Create Model instance for validation
    const recipeModel = new RecipeModel(recipeData);
    
    // 2. Validate data using Model
    const validationErrors = recipeModel.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // 3. Business rules validation
    await this.validateBusinessRules(recipeModel);
    
    // 4. Data transformation and sanitization
    const cleanedData = this.sanitizeRecipeData(recipeModel);
    
    // 5. Check for duplicates (business rule)
    const existingRecipe = await this.recipeRepository.findByTitle(cleanedData.title);
    if (existingRecipe) {
      throw new Error(`Recipe with title "${cleanedData.title}" already exists`);
    }
    
    // 6. Create recipe via repository
    const createdRecipe = await this.recipeRepository.create(cleanedData);
    
    // 7. Post-creation business logic
    await this.handlePostCreation(createdRecipe);
    
    // 8. Return formatted response
    return {
      success: true,
      message: 'Recipe created successfully',
      data: createdRecipe.toJSON()
    };
    
  } catch (error) {
    throw new Error(`Failed to create recipe: ${error.message}`);
  }
}

// Helper method for business rules
async validateBusinessRules(recipeModel) {
  // Rule 1: Maximum ingredients limit for free users
  if (recipeModel.ingredients.length > 20) {
    throw new Error('Maximum 20 ingredients allowed');
  }
  
  // Rule 2: Minimum instructions
  if (recipeModel.instructions.length < 2) {
    throw new Error('Recipe must have at least 2 instruction steps');
  }
  
  // Rule 3: Title length constraints
  if (recipeModel.title.length > 100) {
    throw new Error('Recipe title cannot exceed 100 characters');
  }
}

// Helper method for data sanitization
sanitizeRecipeData(recipeModel) {
  return {
    title: recipeModel.title.trim(),
    description: recipeModel.description?.trim() || null,
    ingredients: recipeModel.ingredients.map(ing => ing.trim()).filter(Boolean),
    instructions: recipeModel.instructions.map(inst => inst.trim()).filter(Boolean),
    prep_time: recipeModel.prep_time || null,
    cook_time: recipeModel.cook_time || null,
    servings: recipeModel.servings || 1
  };
}

// Post-creation business logic
async handlePostCreation(recipe) {
  // Log recipe creation for analytics
  console.log(`New recipe created: ${recipe.id} - ${recipe.title}`);
  
  // Future: Send notifications, update caches, etc.
}
```

#### 4. **Update Recipe**
```javascript
async updateRecipe(id, updateData) {
  try {
    // 1. Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }
    
    // 2. Check if recipe exists
    const existingRecipe = await this.recipeRepository.findById(parseInt(id));
    if (!existingRecipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    
    // 3. Merge existing data with updates
    const mergedData = {
      ...existingRecipe.toJSON(),
      ...updateData
    };
    
    // 4. Validate merged data
    const updatedModel = new RecipeModel(mergedData);
    const validationErrors = updatedModel.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // 5. Business rules for updates
    await this.validateUpdateRules(id, updateData);
    
    // 6. Sanitize update data
    const cleanedUpdateData = this.sanitizeRecipeData(updatedModel);
    
    // 7. Perform update
    const updatedRecipe = await this.recipeRepository.update(parseInt(id), cleanedUpdateData);
    
    // 8. Return formatted response
    return {
      success: true,
      message: 'Recipe updated successfully',
      data: updatedRecipe.toJSON()
    };
    
  } catch (error) {
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
}

// Validation rules specific to updates
async validateUpdateRules(id, updateData) {
  // Rule 1: Title uniqueness (if title is being updated)
  if (updateData.title) {
    const existingWithTitle = await this.recipeRepository.findByTitle(updateData.title);
    if (existingWithTitle && existingWithTitle.id !== id) {
      throw new Error(`Another recipe with title "${updateData.title}" already exists`);
    }
  }
  
  // Rule 2: Cannot reduce ingredients below minimum
  if (updateData.ingredients && updateData.ingredients.length < 1) {
    throw new Error('Recipe must have at least 1 ingredient');
  }
}
```

#### 5. **Delete Recipe**
```javascript
async deleteRecipe(id) {
  try {
    // 1. Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }
    
    // 2. Check if recipe exists
    const existingRecipe = await this.recipeRepository.findById(parseInt(id));
    if (!existingRecipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    
    // 3. Business rules for deletion
    await this.validateDeleteRules(existingRecipe);
    
    // 4. Perform soft delete or hard delete
    const deletedRecipe = await this.recipeRepository.delete(parseInt(id));
    
    // 5. Post-deletion cleanup
    await this.handlePostDeletion(deletedRecipe);
    
    // 6. Return confirmation
    return {
      success: true,
      message: 'Recipe deleted successfully',
      data: deletedRecipe.toJSON()
    };
    
  } catch (error) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}

// Deletion business rules
async validateDeleteRules(recipe) {
  // Rule 1: Featured recipes cannot be deleted
  if (recipe.is_featured) {
    throw new Error('Featured recipes cannot be deleted');
  }
  
  // Rule 2: Check if recipe is referenced elsewhere
  // const dependencies = await this.checkRecipeDependencies(recipe.id);
  // if (dependencies.length > 0) {
  //   throw new Error('Cannot delete recipe with existing dependencies');
  // }
}

// Post-deletion cleanup
async handlePostDeletion(recipe) {
  // Log deletion for audit trail
  console.log(`Recipe deleted: ${recipe.id} - ${recipe.title}`);
  
  // Future: Clean up related data, clear caches, etc.
}
```

## 🔄 Service Layer Patterns

### **1. Repository Orchestration Pattern**
```javascript
async createRecipeWithTags(recipeData, tagIds) {
  try {
    // 1. Create recipe
    const recipe = await this.recipeRepository.create(recipeData);
    
    // 2. Associate tags
    if (tagIds && tagIds.length > 0) {
      await this.tagRepository.associateWithRecipe(recipe.id, tagIds);
    }
    
    // 3. Update search index
    await this.searchService.indexRecipe(recipe);
    
    return recipe;
  } catch (error) {
    // Rollback if needed
    throw error;
  }
}
```

### **2. Data Transformation Pattern**
```javascript
async getRecipeWithNutrition(id) {
  // 1. Get basic recipe
  const recipe = await this.recipeRepository.findById(id);
  
  // 2. Calculate nutrition
  const nutrition = await this.nutritionService.calculateForRecipe(recipe);
  
  // 3. Transform and combine
  return {
    ...recipe.toJSON(),
    nutrition: nutrition,
    healthScore: this.calculateHealthScore(nutrition)
  };
}
```

### **3. Validation Pattern**
```javascript
async validateRecipeData(data) {
  const errors = [];
  
  // Model validation
  const recipe = new RecipeModel(data);
  errors.push(...recipe.validate());
  
  // Business rules validation
  if (data.prep_time && data.prep_time > 480) { // 8 hours
    errors.push('Preparation time cannot exceed 8 hours');
  }
  
  // External validation
  const ingredientValidation = await this.ingredientService.validateIngredients(data.ingredients);
  errors.push(...ingredientValidation);
  
  return errors;
}
```

## 🛡️ Error Handling Strategies

### **1. Specific Error Types**
```javascript
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class BusinessRuleError extends Error {
  constructor(message, rule = null) {
    super(message);
    this.name = 'BusinessRuleError';
    this.rule = rule;
  }
}

// Usage in service
if (errors.length > 0) {
  throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
}
```

### **2. Graceful Degradation**
```javascript
async getRecipeWithExtras(id) {
  const recipe = await this.recipeRepository.findById(id);
  
  // Core data is required
  if (!recipe) {
    throw new Error('Recipe not found');
  }
  
  // Extra data is optional
  let nutrition = null;
  try {
    nutrition = await this.nutritionService.getNutrition(recipe);
  } catch (error) {
    console.warn('Failed to get nutrition data:', error.message);
    // Continue without nutrition data
  }
  
  return {
    ...recipe.toJSON(),
    nutrition
  };
}
```

## 🧪 Testing Service Layer

### **Unit Test Example:**
```javascript
describe('RecipeService', () => {
  let recipeService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    recipeService = new RecipeService(mockRepository);
  });

  describe('createRecipe', () => {
    it('should create recipe with valid data', async () => {
      // Arrange
      const validData = {
        title: 'Test Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      const mockCreatedRecipe = new RecipeModel({
        id: 1,
        ...validData,
        created_at: new Date()
      });
      
      mockRepository.create.mockResolvedValue(mockCreatedRecipe);

      // Act
      const result = await recipeService.createRecipe(validData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.title).toBe(validData.title);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(validData)
      );
    });

    it('should throw validation error for invalid data', async () => {
      // Arrange
      const invalidData = { title: '' }; // Missing required fields

      // Act & Assert
      await expect(recipeService.createRecipe(invalidData))
        .rejects
        .toThrow('Validation failed');
    });
  });
});
```

## 🎯 Best Practices

### **✅ Do's**

1. **Use Model for Validation**
   ```javascript
   // ✅ Good - consistent validation
   const recipe = new RecipeModel(data);
   const errors = recipe.validate();
   ```

2. **Keep Business Logic in Services**
   ```javascript
   // ✅ Good - business rules in service
   if (user.role !== 'admin' && recipe.is_premium) {
     throw new Error('Non-admin users cannot create premium recipes');
   }
   ```

3. **Return Consistent Response Format**
   ```javascript
   // ✅ Good - consistent format
   return {
     success: true,
     message: 'Operation completed',
     data: result.toJSON()
   };
   ```

### **❌ Don'ts**

1. **Don't Put HTTP Logic in Services**
   ```javascript
   // ❌ Bad - HTTP concerns in service
   async createRecipe(req, res) {
     const data = req.body;
     // ... logic ...
     res.status(201).json(result);
   }
   ```

2. **Don't Ignore Error Handling**
   ```javascript
   // ❌ Bad - no error handling
   async createRecipe(data) {
     const recipe = await this.repository.create(data);
     return recipe; // What if repository throws?
   }
   ```

3. **Don't Skip Validation**
   ```javascript
   // ❌ Bad - trusting input data
   async createRecipe(data) {
     return await this.repository.create(data);
   }
   ```

## 🏋️‍♂️ Exercise

### **Exercise 1: Add Business Rule**
Implement a business rule in `createRecipe`:
- Free users can only create 5 recipes
- Premium users have no limit
- Check user plan before creation

### **Exercise 2: Implement Search**
Create a `searchRecipes` method:
- Search by title and ingredients
- Support pagination
- Return formatted results

### **Exercise 3: Add Caching**
Implement caching for `getRecipeById`:
- Cache popular recipes in memory
- Check cache before repository call
- Update cache on recipe updates

## 📚 Further Reading

- [🗃️ Repository Layer Deep Dive](05-repository-layer.md)
- [📋 Model Layer Guide](06-model-layer.md)
- [🧪 Testing Services](08-testing-fundamentals.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Repository Layer →](05-repository-layer.md)**

---

*💡 **Tip**: Service layer adalah tempat untuk mengimplementasikan business logic - jika ragu, tanyakan "ini masalah bisnis atau teknis?"*
