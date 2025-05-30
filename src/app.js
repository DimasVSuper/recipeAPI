const express = require('express');
const app = express();
const recipeRoutes = require('./routes/recipeRoutes');

app.use(express.json());
app.use('/api/recipes', recipeRoutes);

module.exports = app;