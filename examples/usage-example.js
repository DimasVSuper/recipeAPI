// Contoh penggunaan Repository-Model yang sudah diperbaiki
const RecipeModel = require('../src/models/recipeModel');
const recipeRepository = require('../src/repositories/recipeRepository');
const recipeService = require('../src/services/recipeService');

// ========================================
// CONTOH 1: Menggunakan Model langsung
// ========================================
console.log('=== CONTOH 1: Model Usage ===');

// Membuat instance Recipe
const recipeData = {
  title: 'Nasi Goreng Spesial',
  description: 'Nasi goreng dengan bumbu rahasia',
  ingredients: ['nasi', 'telur', 'bawang', 'kecap'],
  instructions: ['Panaskan minyak', 'Tumis bawang', 'Masukkan nasi', 'Aduk rata']
};

const recipe = new RecipeModel(recipeData);
console.log('Recipe Model:', recipe.toJSON());

// Validasi data
const errors = recipe.validate();
if (errors.length > 0) {
  console.log('Validation Errors:', errors);
} else {
  console.log('✅ Data valid!');
}

// Transform untuk database
const dbData = recipe.toDatabase();
console.log('Database format:', dbData);

// ========================================
// CONTOH 2: Repository dengan Model
// ========================================
console.log('\n=== CONTOH 2: Repository Usage ===');

async function repositoryExample() {
  try {
    // CREATE - Repository akan menggunakan Model untuk validasi
    console.log('Creating new recipe...');
    const newRecipe = await recipeRepository.create({
      title: 'Soto Ayam',
      description: 'Soto ayam tradisional',
      ingredients: ['ayam', 'kentang', 'tauge', 'telur'],
      instructions: ['Rebus ayam', 'Tumis bumbu', 'Campur semua']
    });
    console.log('✅ Created:', newRecipe.toJSON());

    // READ - Repository return RecipeModel instance
    console.log('\nGetting recipe by ID...');
    const foundRecipe = await recipeRepository.findById(newRecipe.id);
    if (foundRecipe) {
      console.log('✅ Found:', foundRecipe.toJSON());
    }

    // READ ALL - Repository return array of RecipeModel
    console.log('\nGetting all recipes...');
    const allRecipes = await recipeRepository.findAll();
    console.log('✅ Total recipes:', allRecipes.length);
    allRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} (ID: ${recipe.id})`);
    });

    // UPDATE - Repository akan validasi dengan Model
    console.log('\nUpdating recipe...');
    const updatedRecipe = await recipeRepository.update(newRecipe.id, {
      title: 'Soto Ayam Premium',
      description: 'Soto ayam dengan tambahan daging',
      ingredients: ['ayam', 'daging', 'kentang', 'tauge', 'telur'],
      instructions: ['Rebus ayam dan daging', 'Tumis bumbu', 'Campur semua', 'Sajikan panas']
    });
    console.log('✅ Updated:', updatedRecipe.toJSON());

  } catch (error) {
    console.error('❌ Repository Error:', error.message);
  }
}

// ========================================
// CONTOH 3: Service Layer (Recommended)
// ========================================
console.log('\n=== CONTOH 3: Service Usage (Recommended) ===');

async function serviceExample() {
  try {
    // CREATE via Service - Lebih robust dengan business logic
    console.log('Creating recipe via Service...');
    const createResult = await recipeService.createRecipe({
      title: 'Rendang Padang',
      description: 'Rendang asli Padang',
      ingredients: ['daging sapi', 'santan', 'cabai', 'bawang'],
      instructions: ['Potong daging', 'Tumis bumbu', 'Masak dengan santan', 'Masak hingga kering']
    });
    console.log('✅ Service Create:', createResult);

    // GET via Service
    const recipe = createResult.data;
    const getResult = await recipeService.getRecipeById(recipe.id);
    console.log('✅ Service Get:', getResult);

    // UPDATE via Service
    const updateResult = await recipeService.updateRecipe(recipe.id, {
      title: 'Rendang Padang Premium',
      description: 'Rendang asli Padang dengan daging pilihan',
      ingredients: ['daging sapi grade A', 'santan kental', 'cabai merah', 'bawang merah', 'rempah-rempah'],
      instructions: ['Pilih daging terbaik', 'Tumis bumbu halus', 'Masak dengan santan', 'Masak hingga kering sempurna']
    });
    console.log('✅ Service Update:', updateResult);

    // GET ALL via Service
    const allResult = await recipeService.getAllRecipes();
    console.log('✅ Service Get All:', allResult.data.length, 'recipes');

  } catch (error) {
    console.error('❌ Service Error:', error.message);
  }
}

// ========================================
// CONTOH 4: Error Handling
// ========================================
console.log('\n=== CONTOH 4: Error Handling ===');

async function errorExample() {
  try {
    // Test validasi error
    await recipeService.createRecipe({
      title: '', // Error: empty title
      ingredients: [], // Error: empty ingredients
      instructions: 'not an array' // Error: wrong type
    });
  } catch (error) {
    console.log('❌ Expected validation error:', error.message);
  }

  try {
    // Test not found error
    await recipeService.getRecipeById(99999);
  } catch (error) {
    console.log('❌ Expected not found error:', error.message);
  }
}

// Jalankan contoh-contoh
// repositoryExample();
// serviceExample();
// errorExample();

module.exports = {
  repositoryExample,
  serviceExample,
  errorExample
};
