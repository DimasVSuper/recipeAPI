# ⚙️ Service Layer - Pembelajaran Dasar

> **Panduan lengkap memahami Service Layer dalam Layered Architecture**

## 🎯 Tujuan Pembelajaran

Setelah mempelajari dokumentasi ini, Anda akan memahami:
- Apa itu Service Layer dan perannya dalam aplikasi
- Cara mengimplementasikan business logic dengan benar
- Orchestration dan coordination antar komponen
- Testing strategy untuk Service Layer
- Best practices dan common pitfalls

---

## 🤔 Apa itu Service Layer?

### 📋 **Definisi**
Service Layer adalah layer yang mengatur business logic, rules, dan orchestration dalam aplikasi. Layer ini bertindak sebagai "otak" yang menentukan bagaimana data diproses dan aturan bisnis diterapkan.

### 🏗️ **Posisi dalam Arsitektur**
```
Controller ← SERVICE ← Repository ← Model ← Database
```

Service berada di tengah arsitektur, menerima request dari Controller dan mengkoordinasikan Repository untuk mengakses data.

### 🎭 **Analogi Sederhana**
Service seperti **chef di restoran**:
- **Pelanggan (Controller)**: Memesan makanan
- **Chef (Service)**: Memutuskan resep, mengatur bahan, menentukan urutan masak
- **Asisten chef (Repository)**: Mengambil bahan dari gudang
- **Gudang (Database)**: Menyimpan semua bahan

Chef tidak langsung mengambil bahan, tapi tahu cara mengombinasikan semua bahan menjadi hidangan yang sempurna.

---

## 📝 Tanggung Jawab Service Layer

### ✅ **Yang HARUS dilakukan Service:**
1. **Business Logic**: Implementasi aturan bisnis dan logic aplikasi
2. **Data Orchestration**: Koordinasi pengambilan data dari multiple sources
3. **Validation**: Validasi business rules yang kompleks
4. **Transformation**: Transform data sesuai kebutuhan business
5. **Error Handling**: Handle dan transform errors untuk layer di atasnya
6. **Transaction Management**: Mengelola business transactions
7. **Caching Logic**: Implementasi caching strategy
8. **External Integration**: Koordinasi dengan external services

### ❌ **Yang TIDAK boleh dilakukan Service:**
1. **Database Operations**: Direct database access (gunakan Repository)
2. **HTTP Handling**: Parse HTTP request/response (tugas Controller)
3. **UI Logic**: Logic presentasi atau formatting untuk UI
4. **Infrastructure Concerns**: Logging, monitoring (gunakan middleware)

---

## 🔍 Implementasi Service Layer

### 📦 **Basic Service Structure**

```javascript
// src/services/recipeService.js
const RecipeModel = require('../models/recipeModel');

class RecipeService {
  constructor(recipeRepository, userRepository, notificationService) {
    this.recipeRepository = recipeRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  // READ Operations with Business Logic
  async getAllRecipes(userId, options = {}) {
    try {
      // Business rule: Filter recipes based on user preferences
      const user = await this.userRepository.findById(userId);
      const enhancedOptions = await this.enhanceOptionsForUser(user, options);
      
      const recipes = await this.recipeRepository.findAll(enhancedOptions);
      
      // Business logic: Add user-specific data
      const enrichedRecipes = await this.enrichRecipesForUser(recipes, user);
      
      return {
        recipes: enrichedRecipes.map(recipe => recipe.toJSON()),
        total: enrichedRecipes.length,
        user_preferences: user.preferences
      };
    } catch (error) {
      throw new Error(`Failed to get recipes: ${error.message}`);
    }
  }

  async getRecipeById(id, userId = null) {
    try {
      // Validate input
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('Invalid recipe ID');
      }

      const recipe = await this.recipeRepository.findById(id);
      
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      // Business logic: Check if user can access this recipe
      if (userId) {
        await this.validateUserAccess(userId, recipe);
      }

      // Business logic: Track recipe views
      await this.trackRecipeView(id, userId);

      // Business logic: Get related recipes
      const relatedRecipes = await this.getRelatedRecipes(recipe);

      return {
        recipe: recipe.toJSON(),
        related_recipes: relatedRecipes.map(r => r.toJSON()),
        view_count: await this.getViewCount(id)
      };
    } catch (error) {
      throw error;
    }
  }

  // Business logic helpers
  async enhanceOptionsForUser(user, options) {
    const enhanced = { ...options };
    
    // Apply user dietary restrictions
    if (user.dietary_restrictions) {
      enhanced.exclude_allergens = user.dietary_restrictions;
    }
    
    // Apply user skill level
    if (user.skill_level) {
      enhanced.max_difficulty = this.mapSkillToDifficulty(user.skill_level);
    }
    
    // Apply user time preferences
    if (user.preferred_cooking_time) {
      enhanced.max_cooking_time = user.preferred_cooking_time;
    }
    
    return enhanced;
  }

  async enrichRecipesForUser(recipes, user) {
    const enriched = [];
    
    for (const recipe of recipes) {
      const enrichedRecipe = { ...recipe };
      
      // Business logic: Calculate difficulty for user
      enrichedRecipe.difficulty_for_user = this.calculateDifficultyForUser(recipe, user);
      
      // Business logic: Check if user has made this recipe
      enrichedRecipe.user_has_made = await this.hasUserMadeRecipe(user.id, recipe.id);
      
      // Business logic: Check if user has favorited
      enrichedRecipe.is_favorited = await this.isRecipeFavorited(user.id, recipe.id);
      
      enriched.push(enrichedRecipe);
    }
    
    return enriched;
  }

  mapSkillToDifficulty(skillLevel) {
    const mapping = {
      'beginner': 'Easy',
      'intermediate': 'Medium',
      'advanced': 'Hard'
    };
    return mapping[skillLevel] || 'Medium';
  }
}

module.exports = RecipeService;
```

### ✅ **CREATE Operations with Business Logic**

```javascript
class RecipeService {
  // ... previous methods ...

  async createRecipe(userId, recipeData) {
    try {
      // Business rule: Validate user permissions
      await this.validateUserCanCreateRecipe(userId);
      
      // Business rule: Check recipe uniqueness
      await this.validateRecipeUniqueness(recipeData.title);
      
      // Business rule: Validate recipe data
      const validationResult = await this.validateRecipeData(recipeData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Business logic: Enhance recipe data
      const enhancedData = await this.enhanceRecipeData(recipeData, userId);
      
      // Create recipe
      const recipe = await this.recipeRepository.create(enhancedData);
      
      // Business logic: Post-creation actions
      await this.handlePostCreation(recipe, userId);
      
      return {
        recipe: recipe.toJSON(),
        message: 'Recipe created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUserCanCreateRecipe(userId) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.is_verified) {
      throw new Error('User must be verified to create recipes');
    }
    
    // Business rule: Check daily creation limit
    const todayCount = await this.getUserRecipeCountToday(userId);
    if (todayCount >= 10) {
      throw new Error('Daily recipe creation limit exceeded');
    }
    
    // Business rule: Check subscription status
    if (user.subscription_type === 'free' && todayCount >= 3) {
      throw new Error('Free users can only create 3 recipes per day');
    }
  }

  async validateRecipeUniqueness(title) {
    const existingRecipes = await this.recipeRepository.findByTitle(title);
    
    if (existingRecipes.length > 0) {
      // Business rule: Check similarity threshold
      const similarity = this.calculateTitleSimilarity(title, existingRecipes[0].title);
      if (similarity > 0.8) {
        throw new Error('A very similar recipe already exists');
      }
    }
  }

  async validateRecipeData(recipeData) {
    const errors = [];
    const warnings = [];
    
    // Use Model validation first
    const modelValidation = RecipeModel.validate(recipeData);
    if (!modelValidation.isValid) {
      errors.push(...modelValidation.errors);
    }
    
    // Business rules validation
    if (recipeData.ingredients) {
      const ingredientValidation = await this.validateIngredients(recipeData.ingredients);
      if (!ingredientValidation.isValid) {
        errors.push(...ingredientValidation.errors);
      }
    }
    
    if (recipeData.cooking_time) {
      const timeValidation = this.validateCookingTime(recipeData.cooking_time, recipeData.difficulty);
      if (!timeValidation.isValid) {
        warnings.push(...timeValidation.warnings);
      }
    }
    
    // Business rule: Validate nutritional feasibility
    if (recipeData.estimated_calories && recipeData.servings) {
      const caloriesPerServing = recipeData.estimated_calories / recipeData.servings;
      if (caloriesPerServing < 50) {
        warnings.push('Very low calorie content per serving');
      }
      if (caloriesPerServing > 1000) {
        warnings.push('Very high calorie content per serving');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async enhanceRecipeData(recipeData, userId) {
    const enhanced = { ...recipeData };
    
    // Business logic: Add user ID
    enhanced.created_by = userId;
    
    // Business logic: Generate slug
    enhanced.slug = this.generateUniqueSlug(recipeData.title);
    
    // Business logic: Estimate nutritional info
    enhanced.estimated_calories = await this.estimateCalories(recipeData.ingredients);
    enhanced.estimated_protein = await this.estimateProtein(recipeData.ingredients);
    
    // Business logic: Categorize recipe
    enhanced.category = await this.categorizeRecipe(recipeData);
    
    // Business logic: Add tags
    enhanced.tags = await this.generateTags(recipeData);
    
    // Business logic: Set initial ratings
    enhanced.rating = 0;
    enhanced.rating_count = 0;
    
    return enhanced;
  }

  async handlePostCreation(recipe, userId) {
    // Business logic: Send notifications
    await this.notificationService.notifyFollowers(userId, {
      type: 'new_recipe',
      recipe_id: recipe.id,
      message: 'Created a new recipe'
    });
    
    // Business logic: Update user stats
    await this.updateUserStats(userId, 'recipes_created');
    
    // Business logic: Check for achievements
    await this.checkAchievements(userId);
    
    // Business logic: Index for search
    await this.indexRecipeForSearch(recipe);
  }
}
```

### 🔄 **UPDATE Operations with Business Logic**

```javascript
class RecipeService {
  // ... previous methods ...

  async updateRecipe(id, userId, updateData) {
    try {
      // Business rule: Validate ownership
      const recipe = await this.recipeRepository.findById(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      
      await this.validateUserCanUpdateRecipe(userId, recipe);
      
      // Business rule: Validate update data
      const validationResult = await this.validateUpdateData(updateData, recipe);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Business logic: Process update data
      const processedData = await this.processUpdateData(updateData, recipe);
      
      // Update recipe
      const updatedRecipe = await this.recipeRepository.update(id, processedData);
      
      // Business logic: Post-update actions
      await this.handlePostUpdate(updatedRecipe, recipe, userId);
      
      return {
        recipe: updatedRecipe.toJSON(),
        message: 'Recipe updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUserCanUpdateRecipe(userId, recipe) {
    if (recipe.created_by !== userId) {
      // Business rule: Check if user is admin or moderator
      const user = await this.userRepository.findById(userId);
      if (!user.is_admin && !user.is_moderator) {
        throw new Error('You can only update your own recipes');
      }
    }
    
    // Business rule: Check if recipe is locked
    if (recipe.is_locked) {
      throw new Error('Recipe is locked and cannot be updated');
    }
    
    // Business rule: Check update frequency
    const lastUpdate = new Date(recipe.updated_at);
    const timeDiff = Date.now() - lastUpdate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 1) {
      throw new Error('Recipe can only be updated once per hour');
    }
  }

  async processUpdateData(updateData, existingRecipe) {
    const processed = { ...updateData };
    
    // Business logic: Regenerate slug if title changed
    if (updateData.title && updateData.title !== existingRecipe.title) {
      processed.slug = await this.generateUniqueSlug(updateData.title);
    }
    
    // Business logic: Recalculate nutritional info if ingredients changed
    if (updateData.ingredients) {
      processed.estimated_calories = await this.estimateCalories(updateData.ingredients);
      processed.estimated_protein = await this.estimateProtein(updateData.ingredients);
    }
    
    // Business logic: Update tags if content changed
    if (updateData.title || updateData.ingredients || updateData.instructions) {
      processed.tags = await this.generateTags({
        title: updateData.title || existingRecipe.title,
        ingredients: updateData.ingredients || existingRecipe.ingredients,
        instructions: updateData.instructions || existingRecipe.instructions
      });
    }
    
    // Business logic: Track version history
    processed.version = existingRecipe.version + 1;
    processed.updated_at = new Date();
    
    return processed;
  }

  async handlePostUpdate(updatedRecipe, originalRecipe, userId) {
    // Business logic: Notify followers if significant changes
    const significantChanges = this.detectSignificantChanges(originalRecipe, updatedRecipe);
    if (significantChanges.length > 0) {
      await this.notificationService.notifyFollowers(userId, {
        type: 'recipe_updated',
        recipe_id: updatedRecipe.id,
        changes: significantChanges
      });
    }
    
    // Business logic: Update search index
    await this.updateSearchIndex(updatedRecipe);
    
    // Business logic: Save version history
    await this.saveVersionHistory(updatedRecipe, originalRecipe);
  }
}
```

### ❌ **DELETE Operations with Business Logic**

```javascript
class RecipeService {
  // ... previous methods ...

  async deleteRecipe(id, userId) {
    try {
      const recipe = await this.recipeRepository.findById(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      
      // Business rule: Validate deletion permissions
      await this.validateUserCanDeleteRecipe(userId, recipe);
      
      // Business logic: Check deletion constraints
      await this.validateDeletionConstraints(recipe);
      
      // Business logic: Perform soft delete instead of hard delete
      const deletedRecipe = await this.performSoftDelete(recipe, userId);
      
      // Business logic: Post-deletion cleanup
      await this.handlePostDeletion(deletedRecipe, userId);
      
      return {
        message: 'Recipe deleted successfully',
        recipe_id: id
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUserCanDeleteRecipe(userId, recipe) {
    if (recipe.created_by !== userId) {
      const user = await this.userRepository.findById(userId);
      if (!user.is_admin && !user.is_moderator) {
        throw new Error('You can only delete your own recipes');
      }
    }
  }

  async validateDeletionConstraints(recipe) {
    // Business rule: Check if recipe has active ratings/reviews
    const activeRatings = await this.getActiveRatingsCount(recipe.id);
    if (activeRatings > 10) {
      throw new Error('Cannot delete recipe with more than 10 active ratings');
    }
    
    // Business rule: Check if recipe is featured
    if (recipe.is_featured) {
      throw new Error('Cannot delete featured recipe');
    }
    
    // Business rule: Check if recipe is part of meal plans
    const activeMealPlans = await this.getActiveMealPlansCount(recipe.id);
    if (activeMealPlans > 0) {
      throw new Error('Cannot delete recipe that is part of active meal plans');
    }
  }

  async performSoftDelete(recipe, userId) {
    // Business logic: Soft delete instead of hard delete
    const updateData = {
      deleted_at: new Date(),
      deleted_by: userId,
      is_active: false
    };
    
    return await this.recipeRepository.update(recipe.id, updateData);
  }

  async handlePostDeletion(recipe, userId) {
    // Business logic: Remove from search index
    await this.removeFromSearchIndex(recipe.id);
    
    // Business logic: Update user stats
    await this.updateUserStats(userId, 'recipes_deleted');
    
    // Business logic: Notify followers
    await this.notificationService.notifyFollowers(userId, {
      type: 'recipe_deleted',
      recipe_title: recipe.title
    });
    
    // Business logic: Clean up related data
    await this.cleanupRelatedData(recipe.id);
  }
}
```

### 📊 **Advanced Business Logic Methods**

```javascript
class RecipeService {
  // ... previous methods ...

  // Complex business logic: Recipe recommendation system
  async getRecommendedRecipes(userId, limit = 10) {
    try {
      const user = await this.userRepository.findById(userId);
      
      // Business logic: Multi-factor recommendation
      const recommendations = await this.calculateRecommendations(user);
      
      // Business logic: Apply diversity filter
      const diverseRecommendations = this.applyDiversityFilter(recommendations);
      
      // Business logic: Limit and format results
      return {
        recipes: diverseRecommendations.slice(0, limit).map(r => r.toJSON()),
        recommendation_factors: this.getRecommendationFactors(user),
        total_available: diverseRecommendations.length
      };
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  async calculateRecommendations(user) {
    const factors = [];
    
    // Factor 1: User's past favorites
    if (user.favorite_recipes && user.favorite_recipes.length > 0) {
      const similarToFavorites = await this.getSimilarRecipes(user.favorite_recipes);
      factors.push({ weight: 0.3, recipes: similarToFavorites });
    }
    
    // Factor 2: Popular recipes in user's region
    const popularInRegion = await this.getPopularInRegion(user.region);
    factors.push({ weight: 0.2, recipes: popularInRegion });
    
    // Factor 3: Recipes matching user's dietary preferences
    if (user.dietary_preferences) {
      const matchingDiet = await this.getRecipesMatchingDiet(user.dietary_preferences);
      factors.push({ weight: 0.25, recipes: matchingDiet });
    }
    
    // Factor 4: Trending recipes
    const trending = await this.getTrendingRecipes();
    factors.push({ weight: 0.15, recipes: trending });
    
    // Factor 5: Seasonal recipes
    const seasonal = await this.getSeasonalRecipes();
    factors.push({ weight: 0.1, recipes: seasonal });
    
    // Combine factors with weighted scoring
    return this.combineRecommendationFactors(factors);
  }

  // Business logic: Meal planning
  async generateMealPlan(userId, days = 7, mealsPerDay = 3) {
    try {
      const user = await this.userRepository.findById(userId);
      
      // Business logic: Get user constraints
      const constraints = await this.getMealPlanConstraints(user);
      
      // Business logic: Generate balanced meal plan
      const mealPlan = await this.generateBalancedMealPlan(constraints, days, mealsPerDay);
      
      // Business logic: Validate nutritional balance
      const nutritionValidation = await this.validateNutritionalBalance(mealPlan);
      
      if (!nutritionValidation.isValid) {
        // Business logic: Rebalance meal plan
        mealPlan = await this.rebalanceMealPlan(mealPlan, nutritionValidation.suggestions);
      }
      
      return {
        meal_plan: mealPlan,
        nutritional_summary: await this.calculateNutritionalSummary(mealPlan),
        shopping_list: await this.generateShoppingList(mealPlan)
      };
    } catch (error) {
      throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
  }

  async getMealPlanConstraints(user) {
    return {
      dietary_restrictions: user.dietary_restrictions || [],
      calorie_target: user.daily_calorie_target || 2000,
      protein_target: user.daily_protein_target || 100,
      budget_limit: user.meal_budget || null,
      cooking_time_limit: user.max_cooking_time || null,
      preferred_cuisines: user.preferred_cuisines || [],
      disliked_ingredients: user.disliked_ingredients || []
    };
  }

  // Business logic: Recipe analytics
  async getRecipeAnalytics(recipeId, userId) {
    try {
      const recipe = await this.recipeRepository.findById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      
      // Business rule: Check if user can view analytics
      await this.validateAnalyticsAccess(userId, recipe);
      
      const analytics = await this.calculateRecipeAnalytics(recipe);
      
      return {
        recipe_id: recipeId,
        analytics: analytics,
        generated_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  async calculateRecipeAnalytics(recipe) {
    const [
      viewCount,
      ratingStats,
      commentStats,
      shareStats,
      demographicStats,
      performanceComparison
    ] = await Promise.all([
      this.getViewCount(recipe.id),
      this.getRatingStatistics(recipe.id),
      this.getCommentStatistics(recipe.id),
      this.getShareStatistics(recipe.id),
      this.getDemographicStatistics(recipe.id),
      this.getPerformanceComparison(recipe)
    ]);
    
    return {
      engagement: {
        total_views: viewCount,
        unique_viewers: await this.getUniqueViewersCount(recipe.id),
        average_time_spent: await this.getAverageTimeSpent(recipe.id),
        bounce_rate: await this.getBounceRate(recipe.id)
      },
      ratings: ratingStats,
      comments: commentStats,
      shares: shareStats,
      demographics: demographicStats,
      performance: performanceComparison,
      recommendations: await this.getAnalyticsRecommendations(recipe)
    };
  }

  // Business logic: Batch operations
  async batchProcessRecipes(recipeIds, operation, userId) {
    try {
      // Business rule: Validate batch operation permissions
      await this.validateBatchOperationPermissions(userId, operation);
      
      // Business logic: Process in chunks to avoid timeout
      const chunkSize = 10;
      const results = [];
      
      for (let i = 0; i < recipeIds.length; i += chunkSize) {
        const chunk = recipeIds.slice(i, i + chunkSize);
        const chunkResults = await this.processBatchChunk(chunk, operation, userId);
        results.push(...chunkResults);
      }
      
      return {
        total_processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      };
    } catch (error) {
      throw new Error(`Batch operation failed: ${error.message}`);
    }
  }

  async processBatchChunk(recipeIds, operation, userId) {
    const results = [];
    
    for (const recipeId of recipeIds) {
      try {
        let result;
        
        switch (operation) {
          case 'publish':
            result = await this.publishRecipe(recipeId, userId);
            break;
          case 'unpublish':
            result = await this.unpublishRecipe(recipeId, userId);
            break;
          case 'recalculate_nutrition':
            result = await this.recalculateNutrition(recipeId, userId);
            break;
          case 'reindex':
            result = await this.reindexRecipe(recipeId, userId);
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
        results.push({
          recipe_id: recipeId,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          recipe_id: recipeId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
}
```

---

## 🧪 Testing Service Layer

### 🎯 **Testing Strategy untuk Service**

```javascript
// tests/unit/recipeService.test.js
const RecipeService = require('../../src/services/recipeService');
const RecipeModel = require('../../src/models/recipeModel');

describe('RecipeService', () => {
  let service;
  let mockRecipeRepository;
  let mockUserRepository;
  let mockNotificationService;

  beforeEach(() => {
    mockRecipeRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTitle: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockNotificationService = {
      notifyFollowers: jest.fn(),
      sendEmail: jest.fn()
    };

    service = new RecipeService(
      mockRecipeRepository,
      mockUserRepository,
      mockNotificationService
    );
  });

  describe('getAllRecipes', () => {
    test('should return recipes with user preferences applied', async () => {
      const mockUser = {
        id: 1,
        dietary_restrictions: ['gluten-free'],
        skill_level: 'beginner',
        preferred_cooking_time: 30,
        preferences: { cuisine: 'italian' }
      };

      const mockRecipes = [
        new RecipeModel({ id: 1, title: 'Recipe 1', difficulty: 'Easy' }),
        new RecipeModel({ id: 2, title: 'Recipe 2', difficulty: 'Medium' })
      ];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockRecipeRepository.findAll.mockResolvedValue(mockRecipes);

      // Mock enrichment methods
      service.hasUserMadeRecipe = jest.fn().mockResolvedValue(false);
      service.isRecipeFavorited = jest.fn().mockResolvedValue(false);
      service.calculateDifficultyForUser = jest.fn().mockReturnValue('Easy');

      const result = await service.getAllRecipes(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRecipeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          exclude_allergens: ['gluten-free'],
          max_difficulty: 'Easy',
          max_cooking_time: 30
        })
      );
      expect(result.recipes).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.user_preferences).toEqual(mockUser.preferences);
    });

    test('should handle repository errors', async () => {
      const mockUser = { id: 1, preferences: {} };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockRecipeRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllRecipes(1))
        .rejects.toThrow('Failed to get recipes: Database error');
    });
  });

  describe('createRecipe', () => {
    test('should create recipe with business logic applied', async () => {
      const userId = 1;
      const recipeData = {
        title: 'New Recipe',
        ingredients: 'flour, water, salt',
        instructions: 'Mix and bake',
        cooking_time: 30
      };

      const mockUser = {
        id: userId,
        is_verified: true,
        subscription_type: 'premium'
      };

      const mockCreatedRecipe = new RecipeModel({
        ...recipeData,
        id: 1,
        created_by: userId
      });

      // Mock all the business logic methods
      mockUserRepository.findById.mockResolvedValue(mockUser);
      service.getUserRecipeCountToday = jest.fn().mockResolvedValue(2);
      service.validateRecipeUniqueness = jest.fn().mockResolvedValue();
      service.validateRecipeData = jest.fn().mockResolvedValue({ 
        isValid: true, 
        errors: [], 
        warnings: [] 
      });
      service.enhanceRecipeData = jest.fn().mockResolvedValue({
        ...recipeData,
        created_by: userId,
        slug: 'new-recipe',
        estimated_calories: 300
      });
      service.handlePostCreation = jest.fn().mockResolvedValue();
      
      mockRecipeRepository.create.mockResolvedValue(mockCreatedRecipe);

      const result = await service.createRecipe(userId, recipeData);

      expect(service.validateRecipeUniqueness).toHaveBeenCalledWith(recipeData.title);
      expect(service.validateRecipeData).toHaveBeenCalledWith(recipeData);
      expect(service.enhanceRecipeData).toHaveBeenCalledWith(recipeData, userId);
      expect(mockRecipeRepository.create).toHaveBeenCalled();
      expect(service.handlePostCreation).toHaveBeenCalledWith(mockCreatedRecipe, userId);
      expect(result.recipe).toBeDefined();
      expect(result.message).toBe('Recipe created successfully');
    });

    test('should validate user permissions', async () => {
      const userId = 1;
      const recipeData = { title: 'Test Recipe' };

      const mockUser = {
        id: userId,
        is_verified: false // Not verified
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(service.createRecipe(userId, recipeData))
        .rejects.toThrow('User must be verified to create recipes');
    });

    test('should enforce daily creation limits', async () => {
      const userId = 1;
      const recipeData = { title: 'Test Recipe' };

      const mockUser = {
        id: userId,
        is_verified: true,
        subscription_type: 'free'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      service.getUserRecipeCountToday = jest.fn().mockResolvedValue(3); // At limit

      await expect(service.createRecipe(userId, recipeData))
        .rejects.toThrow('Free users can only create 3 recipes per day');
    });

    test('should validate recipe uniqueness', async () => {
      const userId = 1;
      const recipeData = { title: 'Duplicate Recipe' };

      const mockUser = {
        id: userId,
        is_verified: true,
        subscription_type: 'premium'
      };

      const existingRecipe = new RecipeModel({ title: 'Duplicate Recipe' });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      service.getUserRecipeCountToday = jest.fn().mockResolvedValue(1);
      mockRecipeRepository.findByTitle.mockResolvedValue([existingRecipe]);
      service.calculateTitleSimilarity = jest.fn().mockReturnValue(0.9); // High similarity

      await expect(service.createRecipe(userId, recipeData))
        .rejects.toThrow('A very similar recipe already exists');
    });
  });

  describe('updateRecipe', () => {
    test('should update recipe with business logic', async () => {
      const recipeId = 1;
      const userId = 1;
      const updateData = { title: 'Updated Recipe' };

      const mockExistingRecipe = new RecipeModel({
        id: recipeId,
        title: 'Original Recipe',
        created_by: userId,
        is_locked: false,
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        version: 1
      });

      const mockUpdatedRecipe = new RecipeModel({
        ...mockExistingRecipe,
        ...updateData,
        version: 2
      });

      mockRecipeRepository.findById.mockResolvedValue(mockExistingRecipe);
      service.validateUpdateData = jest.fn().mockResolvedValue({ 
        isValid: true, 
        errors: [] 
      });
      service.processUpdateData = jest.fn().mockResolvedValue({
        ...updateData,
        version: 2,
        updated_at: new Date()
      });
      service.handlePostUpdate = jest.fn().mockResolvedValue();
      mockRecipeRepository.update.mockResolvedValue(mockUpdatedRecipe);

      const result = await service.updateRecipe(recipeId, userId, updateData);

      expect(service.validateUpdateData).toHaveBeenCalledWith(updateData, mockExistingRecipe);
      expect(service.processUpdateData).toHaveBeenCalledWith(updateData, mockExistingRecipe);
      expect(mockRecipeRepository.update).toHaveBeenCalledWith(recipeId, expect.any(Object));
      expect(service.handlePostUpdate).toHaveBeenCalled();
      expect(result.recipe).toBeDefined();
    });

    test('should validate ownership', async () => {
      const recipeId = 1;
      const userId = 2; // Different user
      const updateData = { title: 'Updated Recipe' };

      const mockExistingRecipe = new RecipeModel({
        id: recipeId,
        created_by: 1, // Different user
        is_locked: false
      });

      const mockUser = {
        id: userId,
        is_admin: false,
        is_moderator: false
      };

      mockRecipeRepository.findById.mockResolvedValue(mockExistingRecipe);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(service.updateRecipe(recipeId, userId, updateData))
        .rejects.toThrow('You can only update your own recipes');
    });

    test('should prevent updates to locked recipes', async () => {
      const recipeId = 1;
      const userId = 1;
      const updateData = { title: 'Updated Recipe' };

      const mockExistingRecipe = new RecipeModel({
        id: recipeId,
        created_by: userId,
        is_locked: true // Recipe is locked
      });

      mockRecipeRepository.findById.mockResolvedValue(mockExistingRecipe);

      await expect(service.updateRecipe(recipeId, userId, updateData))
        .rejects.toThrow('Recipe is locked and cannot be updated');
    });
  });

  describe('Business Logic Methods', () => {
    describe('calculateRecommendations', () => {
      test('should calculate recommendations based on user preferences', async () => {
        const mockUser = {
          id: 1,
          favorite_recipes: [1, 2, 3],
          region: 'US',
          dietary_preferences: ['vegetarian']
        };

        const mockSimilarRecipes = [new RecipeModel({ id: 4, title: 'Similar Recipe' })];
        const mockPopularRecipes = [new RecipeModel({ id: 5, title: 'Popular Recipe' })];
        const mockDietaryRecipes = [new RecipeModel({ id: 6, title: 'Vegetarian Recipe' })];
        const mockTrendingRecipes = [new RecipeModel({ id: 7, title: 'Trending Recipe' })];
        const mockSeasonalRecipes = [new RecipeModel({ id: 8, title: 'Seasonal Recipe' })];

        service.getSimilarRecipes = jest.fn().mockResolvedValue(mockSimilarRecipes);
        service.getPopularInRegion = jest.fn().mockResolvedValue(mockPopularRecipes);
        service.getRecipesMatchingDiet = jest.fn().mockResolvedValue(mockDietaryRecipes);
        service.getTrendingRecipes = jest.fn().mockResolvedValue(mockTrendingRecipes);
        service.getSeasonalRecipes = jest.fn().mockResolvedValue(mockSeasonalRecipes);
        service.combineRecommendationFactors = jest.fn().mockReturnValue(mockSimilarRecipes);

        const result = await service.calculateRecommendations(mockUser);

        expect(service.getSimilarRecipes).toHaveBeenCalledWith(mockUser.favorite_recipes);
        expect(service.getPopularInRegion).toHaveBeenCalledWith(mockUser.region);
        expect(service.getRecipesMatchingDiet).toHaveBeenCalledWith(mockUser.dietary_preferences);
        expect(service.getTrendingRecipes).toHaveBeenCalled();
        expect(service.getSeasonalRecipes).toHaveBeenCalled();
        expect(service.combineRecommendationFactors).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ weight: 0.3 }),
            expect.objectContaining({ weight: 0.2 }),
            expect.objectContaining({ weight: 0.25 }),
            expect.objectContaining({ weight: 0.15 }),
            expect.objectContaining({ weight: 0.1 })
          ])
        );
      });
    });

    describe('generateMealPlan', () => {
      test('should generate balanced meal plan', async () => {
        const userId = 1;
        const days = 7;
        const mealsPerDay = 3;

        const mockUser = {
          id: userId,
          dietary_restrictions: ['gluten-free'],
          daily_calorie_target: 2000,
          daily_protein_target: 100
        };

        const mockConstraints = {
          dietary_restrictions: ['gluten-free'],
          calorie_target: 2000,
          protein_target: 100
        };

        const mockMealPlan = [
          { day: 1, meals: [{ type: 'breakfast', recipe: new RecipeModel({ id: 1 }) }] }
        ];

        const mockNutritionValidation = {
          isValid: true,
          suggestions: []
        };

        mockUserRepository.findById.mockResolvedValue(mockUser);
        service.getMealPlanConstraints = jest.fn().mockResolvedValue(mockConstraints);
        service.generateBalancedMealPlan = jest.fn().mockResolvedValue(mockMealPlan);
        service.validateNutritionalBalance = jest.fn().mockResolvedValue(mockNutritionValidation);
        service.calculateNutritionalSummary = jest.fn().mockResolvedValue({ calories: 2000 });
        service.generateShoppingList = jest.fn().mockResolvedValue(['ingredient1', 'ingredient2']);

        const result = await service.generateMealPlan(userId, days, mealsPerDay);

        expect(service.getMealPlanConstraints).toHaveBeenCalledWith(mockUser);
        expect(service.generateBalancedMealPlan).toHaveBeenCalledWith(mockConstraints, days, mealsPerDay);
        expect(service.validateNutritionalBalance).toHaveBeenCalledWith(mockMealPlan);
        expect(result.meal_plan).toEqual(mockMealPlan);
        expect(result.nutritional_summary).toBeDefined();
        expect(result.shopping_list).toBeDefined();
      });

      test('should rebalance meal plan if nutritionally invalid', async () => {
        const userId = 1;
        const mockUser = { id: userId };
        const mockConstraints = {};
        const mockMealPlan = [];
        const mockNutritionValidation = {
          isValid: false,
          suggestions: ['increase protein']
        };
        const mockRebalancedMealPlan = [{ day: 1, meals: [] }];

        mockUserRepository.findById.mockResolvedValue(mockUser);
        service.getMealPlanConstraints = jest.fn().mockResolvedValue(mockConstraints);
        service.generateBalancedMealPlan = jest.fn().mockResolvedValue(mockMealPlan);
        service.validateNutritionalBalance = jest.fn().mockResolvedValue(mockNutritionValidation);
        service.rebalanceMealPlan = jest.fn().mockResolvedValue(mockRebalancedMealPlan);
        service.calculateNutritionalSummary = jest.fn().mockResolvedValue({});
        service.generateShoppingList = jest.fn().mockResolvedValue([]);

        const result = await service.generateMealPlan(userId);

        expect(service.rebalanceMealPlan).toHaveBeenCalledWith(mockMealPlan, mockNutritionValidation.suggestions);
        expect(result.meal_plan).toEqual(mockRebalancedMealPlan);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle repository errors gracefully', async () => {
      mockRecipeRepository.findById.mockRejectedValue(new Error('Database connection lost'));

      await expect(service.getRecipeById(1))
        .rejects.toThrow('Database connection lost');
    });

    test('should handle validation errors properly', async () => {
      const userId = 1;
      const recipeData = { title: '' }; // Invalid data

      const mockUser = { id: userId, is_verified: true };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      service.getUserRecipeCountToday = jest.fn().mockResolvedValue(1);
      service.validateRecipeUniqueness = jest.fn().mockResolvedValue();
      service.validateRecipeData = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['Title is required']
      });

      await expect(service.createRecipe(userId, recipeData))
        .rejects.toThrow('Title is required');
    });
  });
});
```

---

## 🚀 Advanced Service Patterns

### 🏗️ **Service Composition Pattern**

```javascript
// Complex service that uses multiple other services
class RecipeOrchestrationService {
  constructor(
    recipeService,
    userService,
    nutritionService,
    inventoryService,
    notificationService
  ) {
    this.recipeService = recipeService;
    this.userService = userService;
    this.nutritionService = nutritionService;
    this.inventoryService = inventoryService;
    this.notificationService = notificationService;
  }

  async createRecipeWithFullWorkflow(userId, recipeData) {
    try {
      // Step 1: Create recipe
      const recipe = await this.recipeService.createRecipe(userId, recipeData);
      
      // Step 2: Analyze nutrition
      const nutritionAnalysis = await this.nutritionService.analyzeRecipe(recipe.recipe);
      
      // Step 3: Check inventory availability
      const inventoryCheck = await this.inventoryService.checkIngredientAvailability(
        recipe.recipe.ingredients
      );
      
      // Step 4: Update user statistics
      await this.userService.updateUserStatistics(userId, 'recipe_created');
      
      // Step 5: Send notifications
      await this.notificationService.sendCreationNotifications(userId, recipe.recipe);
      
      return {
        recipe: recipe.recipe,
        nutrition: nutritionAnalysis,
        inventory: inventoryCheck,
        workflow_completed: true
      };
    } catch (error) {
      // Handle rollback if needed
      await this.handleWorkflowFailure(userId, recipeData, error);
      throw error;
    }
  }
}
```

### 🔄 **Event-Driven Service Pattern**

```javascript
class RecipeEventService {
  constructor(eventBus, recipeRepository) {
    this.eventBus = eventBus;
    this.recipeRepository = recipeRepository;
    
    // Subscribe to events
    this.eventBus.on('recipe.created', this.handleRecipeCreated.bind(this));
    this.eventBus.on('recipe.updated', this.handleRecipeUpdated.bind(this));
    this.eventBus.on('recipe.deleted', this.handleRecipeDeleted.bind(this));
  }

  async createRecipe(userId, recipeData) {
    const recipe = await this.recipeRepository.create(recipeData);
    
    // Emit event
    this.eventBus.emit('recipe.created', {
      recipe,
      userId,
      timestamp: new Date()
    });
    
    return recipe;
  }

  async handleRecipeCreated(event) {
    const { recipe, userId } = event;
    
    // Trigger multiple async operations
    await Promise.all([
      this.updateSearchIndex(recipe),
      this.generateThumbnail(recipe),
      this.sendNotifications(userId, recipe),
      this.updateAnalytics(recipe)
    ]);
  }
}
```

### 🏭 **Service Factory Pattern**

```javascript
class ServiceFactory {
  constructor() {
    this.services = new Map();
  }

  createRecipeService(dependencies) {
    if (!this.services.has('recipe')) {
      const service = new RecipeService(
        dependencies.recipeRepository,
        dependencies.userRepository,
        dependencies.notificationService
      );
      this.services.set('recipe', service);
    }
    return this.services.get('recipe');
  }

  createUserService(dependencies) {
    if (!this.services.has('user')) {
      const service = new UserService(
        dependencies.userRepository,
        dependencies.authService
      );
      this.services.set('user', service);
    }
    return this.services.get('user');
  }
}
```

---

## 📈 Performance Optimization

### ⚡ **Caching Strategy**

```javascript
class RecipeService {
  constructor(recipeRepository, cache) {
    this.recipeRepository = recipeRepository;
    this.cache = cache;
  }

  async getRecipeById(id) {
    const cacheKey = `recipe:${id}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from repository
    const recipe = await this.recipeRepository.findById(id);
    
    if (recipe) {
      // Cache for 1 hour
      await this.cache.setex(cacheKey, 3600, JSON.stringify(recipe.toJSON()));
    }
    
    return recipe;
  }

  async updateRecipe(id, data) {
    const recipe = await this.recipeRepository.update(id, data);
    
    // Invalidate cache
    await this.cache.del(`recipe:${id}`);
    
    return recipe;
  }
}
```

### 🔄 **Async Processing**

```javascript
class RecipeService {
  constructor(recipeRepository, taskQueue) {
    this.recipeRepository = recipeRepository;
    this.taskQueue = taskQueue;
  }

  async createRecipe(userId, recipeData) {
    // Create recipe immediately
    const recipe = await this.recipeRepository.create(recipeData);
    
    // Queue time-consuming tasks
    await this.taskQueue.add('generate-thumbnail', { recipeId: recipe.id });
    await this.taskQueue.add('analyze-nutrition', { recipeId: recipe.id });
    await this.taskQueue.add('update-search-index', { recipeId: recipe.id });
    
    return recipe;
  }
}
```

---

## 🎯 Summary

### ✅ **Key Takeaways:**
- Service Layer mengatur business logic dan orchestration
- Koordinasi antar repository dan external services
- Implementasi business rules dan validasi kompleks
- Testing harus cover business logic dan edge cases
- Desain yang baik memungkinkan aplikasi yang scalable dan maintainable

### 📚 **Next Steps:**
1. Pelajari Controller Layer untuk HTTP handling
2. Implementasi advanced patterns (CQRS, Event Sourcing)
3. Explore microservices architecture
4. Learn about distributed systems patterns

---

*Happy Service Building! ⚙️✨*

> **Remember:** Service Layer adalah "otak" aplikasi Anda. Di sini semua business logic dan koordinasi terjadi. Desain yang baik akan membuat aplikasi mudah dipahami dan dimodifikasi.
