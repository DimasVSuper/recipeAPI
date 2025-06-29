// Validation middleware untuk recipes
const validateRecipe = (req, res, next) => {
  const { title, ingredients, instructions } = req.body;
  const errors = [];

  // Validasi required fields
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!ingredients || ingredients.trim() === '') {
    errors.push('Ingredients are required');
  }

  if (!instructions || instructions.trim() === '') {
    errors.push('Instructions are required');
  }

  // Validasi panjang minimum
  if (title && title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (ingredients && ingredients.trim().length < 5) {
    errors.push('Ingredients must be at least 5 characters');
  }

  if (instructions && instructions.trim().length < 10) {
    errors.push('Instructions must be at least 10 characters');
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
