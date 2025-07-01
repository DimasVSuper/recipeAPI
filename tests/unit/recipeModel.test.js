// Unit Test untuk RecipeModel
const RecipeModel = require('../../src/models/recipeModel');

describe('RecipeModel', () => {
  describe('Constructor', () => {
    test('should create instance with default values when no data provided', () => {
      const recipe = new RecipeModel();
      
      expect(recipe.id).toBeNull();
      expect(recipe.title).toBe('');
      expect(recipe.description).toBeNull();
      expect(recipe.ingredients).toEqual([]);
      expect(recipe.instructions).toEqual([]);
      expect(recipe.created_at).toBeNull();
      expect(recipe.updated_at).toBeNull();
    });

    test('should create instance with provided data', () => {
      const data = {
        id: 1,
        title: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2'],
        created_at: new Date(),
        updated_at: new Date()
      };

      const recipe = new RecipeModel(data);
      
      expect(recipe.id).toBe(1);
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.description).toBe('Test description');
      expect(recipe.ingredients).toEqual(['ingredient1', 'ingredient2']);
      expect(recipe.instructions).toEqual(['step1', 'step2']);
      expect(recipe.created_at).toEqual(data.created_at);
      expect(recipe.updated_at).toEqual(data.updated_at);
    });
  });

  describe('Static Methods', () => {
    test('getSchema should return correct schema definition', () => {
      const schema = RecipeModel.getSchema();
      
      expect(schema).toEqual({
        id: 'number',
        title: 'string',
        description: 'string|null',
        ingredients: 'array',
        instructions: 'array',
        created_at: 'datetime',
        updated_at: 'datetime'
      });
    });

    test('getRequiredFields should return required fields array', () => {
      const requiredFields = RecipeModel.getRequiredFields();
      
      expect(requiredFields).toEqual(['title', 'ingredients', 'instructions']);
    });
  });

  describe('Instance Methods', () => {
    describe('validate()', () => {
      test('should return no errors for valid data', () => {
        const recipe = new RecipeModel({
          title: 'Valid Recipe',
          ingredients: ['ingredient1'],
          instructions: ['step1']
        });

        const errors = recipe.validate();
        expect(errors).toEqual([]);
      });

      test('should return error for missing title', () => {
        const recipe = new RecipeModel({
          ingredients: ['ingredient1'],
          instructions: ['step1']
        });

        const errors = recipe.validate();
        expect(errors).toContain('title is required');
      });

      test('should return error for short title', () => {
        const recipe = new RecipeModel({
          title: 'AB', // Less than 3 characters
          ingredients: ['ingredient1'],
          instructions: ['step1']
        });

        const errors = recipe.validate();
        expect(errors).toContain('Title must be at least 3 characters');
      });

      test('should return error for empty ingredients array', () => {
        const recipe = new RecipeModel({
          title: 'Valid Recipe',
          ingredients: [],
          instructions: ['step1']
        });

        const errors = recipe.validate();
        expect(errors).toContain('ingredients is required');
      });

      test('should return error for non-array ingredients', () => {
        const recipe = new RecipeModel({
          title: 'Valid Recipe',
          ingredients: 'not an array',
          instructions: ['step1']
        });

        const errors = recipe.validate();
        expect(errors).toContain('Ingredients must be an array');
      });

      test('should return error for empty instructions array', () => {
        const recipe = new RecipeModel({
          title: 'Valid Recipe',
          ingredients: ['ingredient1'],
          instructions: []
        });

        const errors = recipe.validate();
        expect(errors).toContain('instructions is required');
      });

      test('should return multiple errors for multiple invalid fields', () => {
        const recipe = new RecipeModel({
          title: '', // Empty title
          ingredients: [], // Empty array
          instructions: 'not an array' // Wrong type
        });

        const errors = recipe.validate();
        expect(errors.length).toBeGreaterThan(1);
        expect(errors).toContain('title is required');
        expect(errors).toContain('ingredients is required');
        expect(errors).toContain('Instructions must be an array');
      });
    });

    describe('toJSON()', () => {
      test('should return proper JSON representation', () => {
        const data = {
          id: 1,
          title: 'Test Recipe',
          description: 'Test description',
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['step1', 'step2'],
          created_at: new Date('2025-06-30T00:00:00.000Z'),
          updated_at: new Date('2025-06-30T00:00:00.000Z')
        };

        const recipe = new RecipeModel(data);
        const json = recipe.toJSON();

        expect(json).toEqual({
          id: 1,
          title: 'Test Recipe',
          description: 'Test description',
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['step1', 'step2'],
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      });
    });

    describe('toDatabase()', () => {
      test('should return properly formatted data for database', () => {
        const recipe = new RecipeModel({
          id: 1,
          title: '  Test Recipe  ', // With extra spaces
          description: '  Test description  ',
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['step1', 'step2']
        });

        const dbData = recipe.toDatabase();

        expect(dbData).toEqual({
          id: 1,
          title: 'Test Recipe', // Trimmed
          description: 'Test description', // Trimmed
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['step1', 'step2'],
          created_at: null,
          updated_at: null
        });
      });

      test('should handle null description', () => {
        const recipe = new RecipeModel({
          title: 'Test Recipe',
          description: null,
          ingredients: ['ingredient1'],
          instructions: ['step1']
        });

        const dbData = recipe.toDatabase();

        expect(dbData.description).toBeNull();
      });

      test('should convert non-array ingredients to empty array', () => {
        const recipe = new RecipeModel({
          title: 'Test Recipe',
          ingredients: 'not an array',
          instructions: ['step1']
        });

        const dbData = recipe.toDatabase();

        expect(dbData.ingredients).toEqual([]);
      });
    });
  });
});
