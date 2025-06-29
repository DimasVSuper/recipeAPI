const recipeRepository = require('../repositories/recipeRepository');

class RecipeService {
  // GET all recipes - Business logic untuk format response
  async getAllRecipes() {
    try {
      const recipes = await recipeRepository.findAll();
      
      // Business logic: transform data jika perlu
      const transformedRecipes = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || 'No description',
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at
      }));

      return {
        success: true,
        message: 'Recipes retrieved successfully',
        data: transformedRecipes
      };
    } catch (error) {
      throw new Error(`Failed to get recipes: ${error.message}`);
    }
  }

  // GET recipe by ID - Business logic untuk validasi dan format
  async getRecipeById(id) {
    try {
      // Business logic: validasi ID
      if (!id || isNaN(id)) {
        throw new Error('Invalid recipe ID');
      }

      const recipe = await recipeRepository.findById(parseInt(id));
      
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      return {
        success: true,
        message: 'Recipe retrieved successfully',
        data: {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || 'No description',
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          created_at: recipe.created_at,
          updated_at: recipe.updated_at
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // CREATE recipe - Business logic untuk validasi dan processing
  async createRecipe(recipeData) {
    try {
      // Business logic: validasi input
      const errors = this.validateRecipeData(recipeData);
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }

      // Business logic: clean/transform data sebelum save
      const cleanData = {
        title: recipeData.title.trim(),
        description: recipeData.description ? recipeData.description.trim() : null,
        ingredients: recipeData.ingredients, // Already validated as array
        instructions: recipeData.instructions // Already validated as array
      };

      const newRecipe = await recipeRepository.create(cleanData);

      return {
        success: true,
        message: 'Recipe created successfully',
        data: newRecipe
      };
    } catch (error) {
      throw error;
    }
  }

  // Business logic: validasi data recipe
  validateRecipeData(data) {
    const errors = [];

    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      errors.push('Ingredients are required and must be an array');
    }

    if (!data.instructions || !Array.isArray(data.instructions) || data.instructions.length === 0) {
      errors.push('Instructions are required and must be an array');
    }

    // Business rule: title minimal 3 karakter
    if (data.title && data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    return errors;
  }
}

module.exports = new RecipeService();
