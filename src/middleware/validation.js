// Validation middleware untuk recipes
const validateRecipe = (req, res, next) => {
  const { title, ingredients, instructions } = req.body;
  const errors = [];

  // Validasi required fields
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push('Ingredients are required and must be an array');
  }

  if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
    errors.push('Instructions are required and must be an array');
  }

  // Validasi panjang minimum
  if (title && title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (ingredients && Array.isArray(ingredients) && ingredients.length < 1) {
    errors.push('At least one ingredient is required');
  }

  if (instructions && Array.isArray(instructions) && instructions.length < 1) {
    errors.push('At least one instruction is required');
  }

  // Jika ada error, kirim response error
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
      timestamp: new Date().toISOString()
    });
  }

  // Jika validasi berhasil, lanjut ke controller
  next();
};

// Validation middleware untuk ID parameter
const validateId = (req, res, next) => {
  const { id } = req.params;

  // Check if ID is a valid number
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter',
      error: 'ID must be a positive number',
      timestamp: new Date().toISOString()
    });
  }

  // Convert to integer and attach to request
  req.params.id = parseInt(id);
  next();
};

module.exports = {
  validateRecipe,
  validateId
};
