const recipeRepository = require('../repositories/recipeRepository');
const RecipeModel = require('../models/recipeModel');

class RecipeService {
  // GET all recipes - Business logic untuk format response
  async getAllRecipes() {
    try {
      const recipes = await recipeRepository.findAll();
      
      // Data sudah dalam bentuk RecipeModel, langsung transform ke JSON
      const transformedRecipes = recipes.map(recipe => recipe.toJSON());

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
        data: recipe.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // CREATE recipe - Business logic untuk validasi dan processing
  async createRecipe(recipeData) {
    try {
      // Buat instance Model untuk validasi
      const recipeModel = new RecipeModel(recipeData);
      const validationErrors = recipeModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Transform data menggunakan Model sebelum save
      const cleanData = recipeModel.toDatabase();
      const newRecipe = await recipeRepository.create(cleanData);

      return {
        success: true,
        message: 'Recipe created successfully',
        data: newRecipe.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // UPDATE recipe - Business logic untuk validasi dan processing
  async updateRecipe(id, recipeData) {
    try {
      // Business logic: validasi ID
      if (!id || isNaN(id)) {
        throw new Error('Invalid recipe ID');
      }

      // Check if recipe exists
      const existingRecipe = await recipeRepository.findById(parseInt(id));
      if (!existingRecipe) {
        throw new Error('Recipe not found');
      }

      // Buat instance Model untuk validasi
      const recipeModel = new RecipeModel(recipeData);
      const validationErrors = recipeModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Transform data menggunakan Model sebelum update
      const cleanData = recipeModel.toDatabase();
      const updatedRecipe = await recipeRepository.update(parseInt(id), cleanData);

      return {
        success: true,
        message: 'Recipe updated successfully',
        data: updatedRecipe.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // DELETE recipe - Business logic
  async deleteRecipe(id) {
    try {
      // Business logic: validasi ID
      if (!id || isNaN(id)) {
        throw new Error('Invalid recipe ID');
      }

      const deletedRecipe = await recipeRepository.delete(parseInt(id));
      
      if (!deletedRecipe) {
        throw new Error('Recipe not found');
      }

      return {
        success: true,
        message: 'Recipe deleted successfully',
        data: deletedRecipe.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Legacy method - akan dihapus setelah migration
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
