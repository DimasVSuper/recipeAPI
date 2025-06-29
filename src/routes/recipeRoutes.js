const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe, validateId } = require('../middleware/validation');

// GET all recipes (no validation needed)
router.get('/', recipeController.getAllRecipes);

// GET recipe by ID (validate ID parameter)
router.get('/:id', validateId, recipeController.getRecipeById);

// CREATE new recipe (validate request body)
router.post('/', validateRecipe, recipeController.createRecipe);

module.exports = router;