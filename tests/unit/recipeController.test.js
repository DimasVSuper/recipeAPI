// Unit Test untuk RecipeController
const request = require('supertest');
const express = require('express');
const recipeController = require('../../src/controllers/recipeController');
const recipeService = require('../../src/services/recipeService');

// Mock the service
jest.mock('../../src/services/recipeService');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test routes
  app.get('/recipes', recipeController.getAllRecipes);
  app.get('/recipes/:id', recipeController.getRecipeById);
  app.post('/recipes', recipeController.createRecipe);
  app.put('/recipes/:id', recipeController.updateRecipe);
  app.delete('/recipes/:id', recipeController.deleteRecipe);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  
  return app;
};

describe('RecipeController', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /recipes', () => {
    test('should return all recipes successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Recipes retrieved successfully',
        data: [
          {
            id: 1,
            title: 'Recipe 1',
            description: 'Description 1',
            ingredients: ['ingredient1'],
            instructions: ['step1'],
            created_at: null,
            updated_at: null
          }
        ]
      };

      recipeService.getAllRecipes.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/recipes')
        .expect(200);

      expect(recipeService.getAllRecipes).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    test('should handle service errors', async () => {
      recipeService.getAllRecipes.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/recipes')
        .expect(500);

      expect(response.body).toEqual({ error: 'Service error' });
    });
  });

  describe('GET /recipes/:id', () => {
    test('should return specific recipe successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Recipe retrieved successfully',
        data: {
          id: 1,
          title: 'Test Recipe',
          description: 'Test description',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          created_at: null,
          updated_at: null
        }
      };

      recipeService.getRecipeById.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/recipes/1')
        .expect(200);

      expect(recipeService.getRecipeById).toHaveBeenCalledWith('1');
      expect(response.body).toEqual(mockResponse);
    });

    test('should handle recipe not found', async () => {
      recipeService.getRecipeById.mockRejectedValue(new Error('Recipe not found'));

      const response = await request(app)
        .get('/recipes/999')
        .expect(500);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });

    test('should handle invalid ID', async () => {
      recipeService.getRecipeById.mockRejectedValue(new Error('Invalid recipe ID'));

      const response = await request(app)
        .get('/recipes/invalid')
        .expect(500);

      expect(response.body).toEqual({ error: 'Invalid recipe ID' });
    });
  });

  describe('POST /recipes', () => {
    test('should create recipe successfully', async () => {
      const requestBody = {
        title: 'New Recipe',
        description: 'New description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };

      const mockResponse = {
        success: true,
        message: 'Recipe created successfully',
        data: {
          id: 1,
          ...requestBody,
          created_at: null,
          updated_at: null
        }
      };

      recipeService.createRecipe.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/recipes')
        .send(requestBody)
        .expect(201);

      expect(recipeService.createRecipe).toHaveBeenCalledWith(requestBody);
      expect(response.body).toEqual(mockResponse);
    });

    test('should handle validation errors', async () => {
      const invalidRequestBody = {
        title: '', // Empty title
        ingredients: [],
        instructions: []
      };

      recipeService.createRecipe.mockRejectedValue(new Error('Validation errors: title is required'));

      const response = await request(app)
        .post('/recipes')
        .send(invalidRequestBody)
        .expect(500);

      expect(response.body).toEqual({ error: 'Validation errors: title is required' });
    });

    test('should handle service errors', async () => {
      const requestBody = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      recipeService.createRecipe.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/recipes')
        .send(requestBody)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /recipes/:id', () => {
    test('should update recipe successfully', async () => {
      const requestBody = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['new_ingredient1'],
        instructions: ['new_step1']
      };

      const mockResponse = {
        success: true,
        message: 'Recipe updated successfully',
        data: {
          id: 1,
          ...requestBody,
          created_at: null,
          updated_at: null
        }
      };

      recipeService.updateRecipe.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/recipes/1')
        .send(requestBody)
        .expect(200);

      expect(recipeService.updateRecipe).toHaveBeenCalledWith('1', requestBody);
      expect(response.body).toEqual(mockResponse);
    });

    test('should handle recipe not found', async () => {
      const requestBody = {
        title: 'Updated Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      recipeService.updateRecipe.mockRejectedValue(new Error('Recipe not found'));

      const response = await request(app)
        .put('/recipes/999')
        .send(requestBody)
        .expect(500);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });

    test('should handle validation errors', async () => {
      const invalidRequestBody = {
        title: '', // Empty title
        ingredients: [],
        instructions: []
      };

      recipeService.updateRecipe.mockRejectedValue(new Error('Validation errors: title is required'));

      const response = await request(app)
        .put('/recipes/1')
        .send(invalidRequestBody)
        .expect(500);

      expect(response.body).toEqual({ error: 'Validation errors: title is required' });
    });
  });

  describe('DELETE /recipes/:id', () => {
    test('should delete recipe successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Recipe deleted successfully',
        data: {
          id: 1,
          title: 'Deleted Recipe',
          description: 'Deleted description',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          created_at: null,
          updated_at: null
        }
      };

      recipeService.deleteRecipe.mockResolvedValue(mockResponse);

      const response = await request(app)
        .delete('/recipes/1')
        .expect(200);

      expect(recipeService.deleteRecipe).toHaveBeenCalledWith('1');
      expect(response.body).toEqual(mockResponse);
    });

    test('should handle recipe not found', async () => {
      recipeService.deleteRecipe.mockRejectedValue(new Error('Recipe not found'));

      const response = await request(app)
        .delete('/recipes/999')
        .expect(500);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });

    test('should handle invalid ID', async () => {
      recipeService.deleteRecipe.mockRejectedValue(new Error('Invalid recipe ID'));

      const response = await request(app)
        .delete('/recipes/invalid')
        .expect(500);

      expect(response.body).toEqual({ error: 'Invalid recipe ID' });
    });
  });
});
