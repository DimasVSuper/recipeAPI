// Unit Test untuk RecipeRepository
const recipeRepository = require('../../src/repositories/recipeRepository');
const RecipeModel = require('../../src/models/recipeModel');
const db = require('../../src/config/db');

// Mock the database
jest.mock('../../src/config/db');

describe('RecipeRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    test('should return array of RecipeModel instances', async () => {
      // Mock database response
      const mockRows = [
        {
          id: 1,
          title: 'Recipe 1',
          description: 'Description 1',
          ingredients: '["ingredient1", "ingredient2"]',
          instructions: '["step1", "step2"]',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'Recipe 2',
          description: 'Description 2',
          ingredients: '["ingredient3", "ingredient4"]',
          instructions: '["step3", "step4"]',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      db.query.mockResolvedValue([mockRows]);

      const result = await recipeRepository.findAll();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM recipes ORDER BY created_at DESC');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RecipeModel);
      expect(result[1]).toBeInstanceOf(RecipeModel);
      expect(result[0].title).toBe('Recipe 1');
      expect(result[0].ingredients).toEqual(['ingredient1', 'ingredient2']);
      expect(result[1].title).toBe('Recipe 2');
    });

    test('should return empty array when no recipes found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await recipeRepository.findAll();

      expect(result).toEqual([]);
    });

    test('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(recipeRepository.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById()', () => {
    test('should return RecipeModel instance when recipe found', async () => {
      const mockRow = {
        id: 1,
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: '["ingredient1", "ingredient2"]',
        instructions: '["step1", "step2"]',
        created_at: new Date(),
        updated_at: new Date()
      };

      db.query.mockResolvedValue([[mockRow]]);

      const result = await recipeRepository.findById(1);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM recipes WHERE id = ?', [1]);
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Recipe');
      expect(result.ingredients).toEqual(['ingredient1', 'ingredient2']);
    });

    test('should return null when recipe not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await recipeRepository.findById(999);

      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(recipeRepository.findById(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('create()', () => {
    test('should create recipe and return RecipeModel instance', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'New description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };

      const mockInsertResult = { insertId: 1 };
      const mockCreatedRecipe = {
        id: 1,
        title: 'New Recipe',
        description: 'New description',
        ingredients: '["ingredient1", "ingredient2"]',
        instructions: '["step1", "step2"]',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock INSERT query
      db.query.mockResolvedValueOnce([mockInsertResult]);
      // Mock SELECT query for findById
      db.query.mockResolvedValueOnce([[mockCreatedRecipe]]);

      const result = await recipeRepository.create(recipeData);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
        ['New Recipe', 'New description', '["ingredient1","ingredient2"]', '["step1","step2"]']
      );
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.id).toBe(1);
      expect(result.title).toBe('New Recipe');
    });

    test('should throw validation error for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        ingredients: [],
        instructions: []
      };

      await expect(recipeRepository.create(invalidData)).rejects.toThrow('Data validation failed');
    });

    test('should handle database errors during insert', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'New description',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      db.query.mockRejectedValue(new Error('Database insert failed'));

      await expect(recipeRepository.create(recipeData)).rejects.toThrow('Database insert failed');
    });
  });

  describe('update()', () => {
    test('should update recipe and return updated RecipeModel instance', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['new_ingredient1', 'new_ingredient2'],
        instructions: ['new_step1', 'new_step2']
      };

      const mockUpdatedRecipe = {
        id: 1,
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: '["new_ingredient1", "new_ingredient2"]',
        instructions: '["new_step1", "new_step2"]',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock UPDATE query
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Mock SELECT query for findById
      db.query.mockResolvedValueOnce([[mockUpdatedRecipe]]);

      const result = await recipeRepository.update(1, updateData);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'UPDATE recipes SET title = ?, description = ?, ingredients = ?, instructions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['Updated Recipe', 'Updated description', '["new_ingredient1","new_ingredient2"]', '["new_step1","new_step2"]', 1]
      );
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.title).toBe('Updated Recipe');
    });

    test('should throw validation error for invalid update data', async () => {
      const invalidData = {
        title: '', // Empty title
        ingredients: [],
        instructions: []
      };

      await expect(recipeRepository.update(1, invalidData)).rejects.toThrow('Data validation failed');
    });

    test('should handle database errors during update', async () => {
      const updateData = {
        title: 'Updated Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      db.query.mockRejectedValue(new Error('Database update failed'));

      await expect(recipeRepository.update(1, updateData)).rejects.toThrow('Database update failed');
    });
  });

  describe('delete()', () => {
    test('should delete recipe and return deleted RecipeModel instance', async () => {
      const mockRecipe = {
        id: 1,
        title: 'Recipe to Delete',
        description: 'To be deleted',
        ingredients: '["ingredient1"]',
        instructions: '["step1"]',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock SELECT query for findById
      db.query.mockResolvedValueOnce([[mockRecipe]]);
      // Mock DELETE query
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await recipeRepository.delete(1);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM recipes WHERE id = ?', [1]);
      expect(db.query).toHaveBeenNthCalledWith(2, 'DELETE FROM recipes WHERE id = ?', [1]);
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Recipe to Delete');
    });

    test('should return null when recipe not found', async () => {
      // Mock SELECT query returning no results
      db.query.mockResolvedValueOnce([[]]);

      const result = await recipeRepository.delete(999);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM recipes WHERE id = ?', [999]);
      expect(result).toBeNull();
    });

    test('should handle database errors during delete', async () => {
      const mockRecipe = {
        id: 1,
        title: 'Recipe to Delete',
        ingredients: '["ingredient1"]',
        instructions: '["step1"]'
      };

      db.query.mockResolvedValueOnce([[mockRecipe]]);
      db.query.mockRejectedValueOnce(new Error('Database delete failed'));

      await expect(recipeRepository.delete(1)).rejects.toThrow('Database delete failed');
    });
  });

  describe('validateWithModel()', () => {
    test('should return empty array for valid data', () => {
      const validData = {
        title: 'Valid Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      const errors = recipeRepository.validateWithModel(validData);
      expect(errors).toEqual([]);
    });

    test('should return errors for invalid data', () => {
      const invalidData = {
        title: '', // Empty title
        ingredients: [], // Empty array
        instructions: [] // Empty array
      };

      const errors = recipeRepository.validateWithModel(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('title is required');
      expect(errors).toContain('ingredients is required');
      expect(errors).toContain('instructions is required');
    });

    test('should validate data types', () => {
      const invalidData = {
        title: 123, // Should be string
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      const errors = recipeRepository.validateWithModel(invalidData);
      expect(errors).toContain('title must be a string');
    });
  });
});
