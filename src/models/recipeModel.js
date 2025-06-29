// Recipe Model - HANYA untuk struktur data dan schema
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    this.ingredients = data.ingredients || '';
    this.instructions = data.instructions || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Method untuk validasi struktur data
  static getSchema() {
    return {
      id: 'number',
      title: 'string',
      description: 'string|null',
      ingredients: 'string',
      instructions: 'string',
      created_at: 'datetime',
      updated_at: 'datetime'
    };
  }

  // Method untuk mendapatkan field yang required
  static getRequiredFields() {
    return ['title', 'ingredients', 'instructions'];
  }

  // Method untuk convert ke JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      ingredients: this.ingredients,
      instructions: this.instructions,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = RecipeModel;