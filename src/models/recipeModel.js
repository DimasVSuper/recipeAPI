const db = require('../config/db');

async function getAllRecipes() {
  const [rows] = await db.query('SELECT * FROM recipes');
  return rows;
}

async function getRecipeById(id) {
  const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
  return rows[0];
}

async function createRecipe({ title, description, ingredients, instructions }) {
  const [result] = await db.query(
    'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
    [title, description, ingredients, instructions]
  );
  return { id: result.insertId, title, description, ingredients, instructions };
}

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe
};