const recipeModel = require('../models/recipeModel');

async function getAllRecipes(req, res) {
  try {
    const recipes = await recipeModel.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
}

async function getRecipeById(req, res) {
  try {
    const recipe = await recipeModel.getRecipeById(req.params.id);
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe' });
  }
}

async function createRecipe(req, res) {
  try {
    const { title, description, ingredients, instructions } = req.body;
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Title, ingredients, and instructions are required' });
    }
    const recipe = await recipeModel.createRecipe({ title, description, ingredients, instructions });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe' });
  }
}

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe
};