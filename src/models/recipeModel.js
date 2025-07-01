// Recipe Model - HANYA untuk struktur data dan schema
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    this.ingredients = data.ingredients || [];
    this.instructions = data.instructions || [];
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Method untuk validasi struktur data
  static getSchema() {
    return {
      id: 'number',
      title: 'string',
      description: 'string|null',
      ingredients: 'array',
      instructions: 'array',
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

  // Method untuk validasi data instance
  validate() {
    const errors = [];
    const requiredFields = RecipeModel.getRequiredFields();

    requiredFields.forEach(field => {
      if (!this[field] || (Array.isArray(this[field]) && this[field].length === 0)) {
        errors.push(`${field} is required`);
      }
    });

    // Validasi business rules
    if (this.title && this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (this.ingredients && !Array.isArray(this.ingredients)) {
      errors.push('Ingredients must be an array');
    }

    if (this.instructions && !Array.isArray(this.instructions)) {
      errors.push('Instructions must be an array');
    }

    return errors;
  }

  // Method untuk transform data sebelum save ke database
  toDatabase() {
    return {
      id: this.id,
      title: this.title?.trim(),
      description: this.description?.trim() || null,
      ingredients: Array.isArray(this.ingredients) ? this.ingredients : [],
      instructions: Array.isArray(this.instructions) ? this.instructions : [],
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = RecipeModel;