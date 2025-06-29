// Validation middleware untuk recipes
const validateRecipe = (req, res, next) => {
  const { title, ingredients, instructions } = req.body;
  const errors = [];

  // Validasi required fields
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  // Handle ingredients (bisa array atau string JSON)
  if (!ingredients) {
    errors.push('Ingredients are required');
  } else if (typeof ingredients === 'string') {
    // Jika string, coba parse sebagai JSON
    try {
      const parsedIngredients = JSON.parse(ingredients);
      if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
        errors.push('Ingredients must be a valid JSON array with at least one item');
      }
      // Replace string dengan parsed array
      req.body.ingredients = parsedIngredients;
    } catch (e) {
      errors.push('Ingredients must be a valid JSON array');
    }
  } else if (!Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push('Ingredients are required and must be an array');
  }

  // Handle instructions (bisa array atau string JSON)
  if (!instructions) {
    errors.push('Instructions are required');
  } else if (typeof instructions === 'string') {
    // Jika string, coba parse sebagai JSON
    try {
      const parsedInstructions = JSON.parse(instructions);
      if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
        errors.push('Instructions must be a valid JSON array with at least one item');
      }
      // Replace string dengan parsed array
      req.body.instructions = parsedInstructions;
    } catch (e) {
      errors.push('Instructions must be a valid JSON array');
    }
  } else if (!Array.isArray(instructions) || instructions.length === 0) {
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
