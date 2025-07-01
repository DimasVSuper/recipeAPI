const db = require('../config/db');
const RecipeModel = require('../models/recipeModel');

class RecipeRepository {
  // GET all recipes - HANYA database operation
  async findAll() {
    const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
    // Transform raw data menggunakan Model
    return rows.map(row => {
      // Parse JSON strings back to arrays
      const parsedRow = {
        ...row,
        ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
        instructions: typeof row.instructions === 'string' ? JSON.parse(row.instructions) : row.instructions
      };
      return new RecipeModel(parsedRow);
    });
  }

  // GET recipe by ID - HANYA database operation
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!rows[0]) {
      return null;
    }
    
    // Parse JSON strings back to arrays dan transform menggunakan Model
    const parsedRow = {
      ...rows[0],
      ingredients: typeof rows[0].ingredients === 'string' ? JSON.parse(rows[0].ingredients) : rows[0].ingredients,
      instructions: typeof rows[0].instructions === 'string' ? JSON.parse(rows[0].instructions) : rows[0].instructions
    };
    
    return new RecipeModel(parsedRow);
  }

  // CREATE recipe - HANYA database operation
  async create(recipeData) {
    // Validasi menggunakan Model schema
    const errors = this.validateWithModel(recipeData);
    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }

    const { title, description, ingredients, instructions } = recipeData;
    const [result] = await db.query(
      'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
      [title, description || null, JSON.stringify(ingredients), JSON.stringify(instructions)]
    );
    
    // Return data yang baru dibuat menggunakan Model
    return this.findById(result.insertId);
  }

  // UPDATE recipe - HANYA database operation
  async update(id, recipeData) {
    // Validasi menggunakan Model schema
    const errors = this.validateWithModel(recipeData);
    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }

    const { title, description, ingredients, instructions } = recipeData;
    await db.query(
      'UPDATE recipes SET title = ?, description = ?, ingredients = ?, instructions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, JSON.stringify(ingredients), JSON.stringify(instructions), id]
    );
    
    return this.findById(id);
  }

  // DELETE recipe - HANYA database operation (coming soon)
  async delete(id) {
    const recipe = await this.findById(id);
    if (recipe) {
      await db.query('DELETE FROM recipes WHERE id = ?', [id]);
    }
    return recipe;
  }

  // Validasi data menggunakan Model schema
  validateWithModel(data) {
    const errors = [];
    const requiredFields = RecipeModel.getRequiredFields();
    const schema = RecipeModel.getSchema();

    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push(`${field} is required`);
      }
    });

    // Check data types
    Object.keys(data).forEach(field => {
      if (schema[field] && data[field] !== null && data[field] !== undefined) {
        const expectedType = schema[field].split('|')[0]; // Get base type (ignore nullable)
        const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
        
        if (expectedType === 'string' && actualType !== 'string') {
          errors.push(`${field} must be a string`);
        }
      }
    });

    return errors;
  }
}

module.exports = new RecipeRepository();
