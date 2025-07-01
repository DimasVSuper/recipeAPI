const recipeService = require('../services/recipeService');

class RecipeController {
  // GET all recipes - HANYA handle HTTP request/response
  async getAllRecipes(req, res, next) {
    try {
      const result = await recipeService.getAllRecipes();
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  }

  // GET recipe by ID - HANYA handle HTTP request/response
  async getRecipeById(req, res, next) {
    try {
      // ID sudah divalidasi di middleware
      const result = await recipeService.getRecipeById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  }

  // CREATE recipe - HANYA handle HTTP request/response
  async createRecipe(req, res, next) {
    try {
      // Request body sudah divalidasi di middleware
      const result = await recipeService.createRecipe(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  }

  // UPDATE recipe - HANYA handle HTTP request/response
  async updateRecipe(req, res, next) {
    try {
      // ID dan request body sudah divalidasi di middleware
      const result = await recipeService.updateRecipe(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  }

  // DELETE recipe - HANYA handle HTTP request/response
  async deleteRecipe(req, res, next) {
    try {
      // ID sudah divalidasi di middleware
      const result = await recipeService.deleteRecipe(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  }
}

module.exports = new RecipeController();