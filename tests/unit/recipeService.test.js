// Unit Test untuk RecipeService
const recipeService = require('../../src/services/recipeService');
const recipeRepository = require('../../src/repositories/recipeRepository');
const RecipeModel = require('../../src/models/recipeModel');

// Mock the repository
jest.mock('../../src/repositories/recipeRepository');

describe('RecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRecipes()', () => {
    test('should return formatted response with all recipes', async () => {
      const mockRecipes = [
        new RecipeModel({
          id: 1,
          title: 'Recipe 1',
          description: 'Description 1',
          ingredients: ['ingredient1'],
          instructions: ['step1']
        }),
        new RecipeModel({
          id: 2,
          title: 'Recipe 2',
          description: 'Description 2',
          ingredients: ['ingredient2'],
          instructions: ['step2']
        })
      ];

      recipeRepository.findAll.mockResolvedValue(mockRecipes);

      const result = await recipeService.getAllRecipes();

      expect(recipeRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
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
          },
          {
            id: 2,
            title: 'Recipe 2',
            description: 'Description 2',
            ingredients: ['ingredient2'],
            instructions: ['step2'],
            created_at: null,
            updated_at: null
          }
        ]
      });
    });

    test('should return empty array when no recipes found', async () => {
      recipeRepository.findAll.mockResolvedValue([]);

      const result = await recipeService.getAllRecipes();

      expect(result.data).toEqual([]);
      expect(result.success).toBe(true);
    });

    test('should throw error when repository fails', async () => {
      recipeRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(recipeService.getAllRecipes()).rejects.toThrow('Failed to get recipes: Database error');
    });
  });

  describe('getRecipeById()', () => {
    test('should return recipe when found', async () => {
      const mockRecipe = new RecipeModel({
        id: 1,
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });

      recipeRepository.findById.mockResolvedValue(mockRecipe);

      const result = await recipeService.getRecipeById(1);

      expect(recipeRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
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
      });
    });

    test('should throw error for invalid ID', async () => {
      await expect(recipeService.getRecipeById('invalid')).rejects.toThrow('Invalid recipe ID');
      await expect(recipeService.getRecipeById(null)).rejects.toThrow('Invalid recipe ID');
      await expect(recipeService.getRecipeById('')).rejects.toThrow('Invalid recipe ID');
    });

    test('should throw error when recipe not found', async () => {
      recipeRepository.findById.mockResolvedValue(null);

      await expect(recipeService.getRecipeById(999)).rejects.toThrow('Recipe not found');
    });

    test('should handle repository errors', async () => {
      recipeRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(recipeService.getRecipeById(1)).rejects.toThrow('Database error');
    });
  });

  describe('createRecipe()', () => {
    test('should create recipe with valid data', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'New description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };

      const mockCreatedRecipe = new RecipeModel({
        id: 1,
        ...recipeData
      });

      recipeRepository.create.mockResolvedValue(mockCreatedRecipe);

      const result = await recipeService.createRecipe(recipeData);

      expect(recipeRepository.create).toHaveBeenCalledWith({
        id: null,
        title: 'New Recipe',
        description: 'New description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2'],
        created_at: null,
        updated_at: null
      });

      expect(result).toEqual({
        success: true,
        message: 'Recipe created successfully',
        data: {
          id: 1,
          title: 'New Recipe',
          description: 'New description',
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['step1', 'step2'],
          created_at: null,
          updated_at: null
        }
      });
    });

    test('should throw validation error for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        ingredients: [],
        instructions: []
      };

      await expect(recipeService.createRecipe(invalidData)).rejects.toThrow('Validation errors:');
    });

    test('should throw validation error for short title', async () => {
      const invalidData = {
        title: 'AB', // Less than 3 characters
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      await expect(recipeService.createRecipe(invalidData)).rejects.toThrow('Title must be at least 3 characters');
    });

    test('should handle repository errors', async () => {
      const validData = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      recipeRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(recipeService.createRecipe(validData)).rejects.toThrow('Database error');
    });
  });

  describe('updateRecipe()', () => {
    test('should update recipe with valid data', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['new_ingredient1'],
        instructions: ['new_step1']
      };

      const mockExistingRecipe = new RecipeModel({
        id: 1,
        title: 'Old Recipe',
        ingredients: ['old_ingredient'],
        instructions: ['old_step']
      });

      const mockUpdatedRecipe = new RecipeModel({
        id: 1,
        ...updateData
      });

      recipeRepository.findById.mockResolvedValue(mockExistingRecipe);
      recipeRepository.update.mockResolvedValue(mockUpdatedRecipe);

      const result = await recipeService.updateRecipe(1, updateData);

      expect(recipeRepository.findById).toHaveBeenCalledWith(1);
      expect(recipeRepository.update).toHaveBeenCalledWith(1, {
        id: null,
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['new_ingredient1'],
        instructions: ['new_step1'],
        created_at: null,
        updated_at: null
      });

      expect(result).toEqual({
        success: true,
        message: 'Recipe updated successfully',
        data: {
          id: 1,
          title: 'Updated Recipe',
          description: 'Updated description',
          ingredients: ['new_ingredient1'],
          instructions: ['new_step1'],
          created_at: null,
          updated_at: null
        }
      });
    });

    test('should throw error for invalid ID', async () => {
      const updateData = { title: 'Valid Title', ingredients: ['ing'], instructions: ['step'] };

      await expect(recipeService.updateRecipe('invalid', updateData)).rejects.toThrow('Invalid recipe ID');
      await expect(recipeService.updateRecipe(null, updateData)).rejects.toThrow('Invalid recipe ID');
    });

    test('should throw error when recipe not found', async () => {
      const updateData = { title: 'Valid Title', ingredients: ['ing'], instructions: ['step'] };

      recipeRepository.findById.mockResolvedValue(null);

      await expect(recipeService.updateRecipe(999, updateData)).rejects.toThrow('Recipe not found');
    });

    test('should throw validation error for invalid update data', async () => {
      const mockExistingRecipe = new RecipeModel({ id: 1, title: 'Existing', ingredients: ['ing'], instructions: ['step'] });
      const invalidData = { title: '', ingredients: [], instructions: [] };

      recipeRepository.findById.mockResolvedValue(mockExistingRecipe);

      await expect(recipeService.updateRecipe(1, invalidData)).rejects.toThrow('Validation errors:');
    });

    test('should handle repository errors', async () => {
      const mockExistingRecipe = new RecipeModel({ id: 1, title: 'Existing', ingredients: ['ing'], instructions: ['step'] });
      const validData = { title: 'Valid Title', ingredients: ['ing'], instructions: ['step'] };

      recipeRepository.findById.mockResolvedValue(mockExistingRecipe);
      recipeRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(recipeService.updateRecipe(1, validData)).rejects.toThrow('Database error');
    });
  });

  describe('deleteRecipe()', () => {
    test('should delete recipe when found', async () => {
      const mockDeletedRecipe = new RecipeModel({
        id: 1,
        title: 'Recipe to Delete',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      });

      recipeRepository.delete.mockResolvedValue(mockDeletedRecipe);

      const result = await recipeService.deleteRecipe(1);

      expect(recipeRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: 'Recipe deleted successfully',
        data: {
          id: 1,
          title: 'Recipe to Delete',
          description: null,
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          created_at: null,
          updated_at: null
        }
      });
    });

    test('should throw error for invalid ID', async () => {
      await expect(recipeService.deleteRecipe('invalid')).rejects.toThrow('Invalid recipe ID');
      await expect(recipeService.deleteRecipe(null)).rejects.toThrow('Invalid recipe ID');
    });

    test('should throw error when recipe not found', async () => {
      recipeRepository.delete.mockResolvedValue(null);

      await expect(recipeService.deleteRecipe(999)).rejects.toThrow('Recipe not found');
    });

    test('should handle repository errors', async () => {
      recipeRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(recipeService.deleteRecipe(1)).rejects.toThrow('Database error');
    });
  });

  describe('validateRecipeData() - Legacy method', () => {
    test('should return empty array for valid data', () => {
      const validData = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      const errors = recipeService.validateRecipeData(validData);
      expect(errors).toEqual([]);
    });

    test('should return errors for invalid data', () => {
      const invalidData = {
        title: '',
        ingredients: [],
        instructions: 'not an array'
      };

      const errors = recipeService.validateRecipeData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Title is required');
    });
  });
});
