const db = require('../config/db');

class RecipeRepository {
  // GET all recipes - HANYA database operation
  async findAll() {
    const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
    return rows;
  }

  // GET recipe by ID - HANYA database operation
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // CREATE recipe - HANYA database operation
  async create(recipeData) {
    const { title, description, ingredients, instructions } = recipeData;
    const [result] = await db.query(
      'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
      [title, description || null, JSON.stringify(ingredients), JSON.stringify(instructions)]
    );
    
    // Return data yang baru dibuat
    return this.findById(result.insertId);
  }

  // UPDATE recipe - HANYA database operation (coming soon)
  async update(id, recipeData) {
    const { title, description, ingredients, instructions } = recipeData;
    await db.query(
      'UPDATE recipes SET title = ?, description = ?, ingredients = ?, instructions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, ingredients, instructions, id]
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
}

module.exports = new RecipeRepository();
