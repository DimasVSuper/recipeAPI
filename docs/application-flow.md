# 🔄 Cara Kerja Recipe API - Flow Lengkap

Dokumentasi ini menjelaskan **bagaimana aplikasi Recipe API bekerja** dari awal sampai akhir dengan urutan yang jelas untuk pembelajaran.

## 🚀 1. Startup Aplikasi

### **Step 1: Entry Point (`index.js`)**
```javascript
// 1. Import aplikasi Express
const app = require('./src/app');

// 2. Set port dan start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### **Step 2: Konfigurasi App (`src/app.js`)**
```javascript
// 1. Import Express dan dependencies
const express = require('express');
const app = express();

// 2. Setup middleware
app.use(express.json()); // Parse JSON dari request body

// 3. Setup routes
app.use('/api/recipes', recipeRoutes);

// 4. Export app
module.exports = app;
```

### **Step 3: Database Connection (`src/config/db.js`)**
```javascript
// 1. Load environment variables
require('dotenv').config();

// 2. Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ... config lainnya
});

// 3. Export connection untuk digunakan di Repository
module.exports = pool.promise();
```

## 📨 2. Request Flow - GET All Recipes

Mari ikuti **perjalanan request** `GET /api/recipes` dari awal sampai akhir:

### **Step 1: Client Request**
```
Client (Postman/Browser) → GET http://localhost:3000/api/recipes
```

### **Step 2: Express Router (`src/routes/recipeRoutes.js`)**
```javascript
// 1. Express menerima request
// 2. Match dengan route pattern
router.get('/', recipeController.getAllRecipes);

// 3. Panggil controller method
```

### **Step 3: Controller Layer (`src/controllers/recipeController.js`)**
```javascript
async getAllRecipes(req, res) {
  try {
    // 1. Terima HTTP request
    console.log('Controller: Menerima request GET /api/recipes');
    
    // 2. Panggil Service layer (TIDAK langsung ke database!)
    const result = await recipeService.getAllRecipes();
    
    // 3. Kirim HTTP response
    res.status(200).json(result);
  } catch (error) {
    // 4. Handle error dan kirim error response
    res.status(500).json({ error: error.message });
  }
}
```

### **Step 4: Service Layer (`src/services/recipeService.js`)**
```javascript
async getAllRecipes() {
  try {
    console.log('Service: Memproses business logic');
    
    // 1. Panggil Repository untuk ambil data
    const recipes = await recipeRepository.findAll();
    
    // 2. Business logic: Transform data
    const transformedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description || 'No description',
      // ... transform lainnya
    }));
    
    // 3. Format response sesuai API standard
    return {
      success: true,
      message: 'Recipes retrieved successfully',
      data: transformedRecipes
    };
  } catch (error) {
    throw new Error(`Failed to get recipes: ${error.message}`);
  }
}
```

### **Step 5: Repository Layer (`src/repositories/recipeRepository.js`)**
```javascript
async findAll() {
  console.log('Repository: Mengambil data dari database');
  
  // 1. Execute SQL query
  const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
  
  // 2. Return raw data dari database
  return rows;
}
```

### **Step 6: Database Operation**
```sql
-- MySQL menjalankan query
SELECT * FROM recipes ORDER BY created_at DESC;

-- Return hasil ke Repository
```

### **Step 7: Response Flow (Balik ke Client)**
```
Database → Repository → Service → Controller → Client
```

## 📝 3. Request Flow - POST Create Recipe

Mari ikuti **perjalanan request** `POST /api/recipes` dengan data baru:

### **Step 1: Client Request**
```json
POST http://localhost:3000/api/recipes
Content-Type: application/json

{
  "title": "Gado-gado",
  "description": "Salad Indonesia",
  "ingredients": "Sayuran, bumbu kacang",
  "instructions": "Rebus sayuran, siram bumbu kacang"
}
```

### **Step 2: Express Middleware**
```javascript
// 1. express.json() middleware parse request body
app.use(express.json());

// 2. Data tersedia di req.body
console.log(req.body); // { title: "Gado-gado", ... }
```

### **Step 3: Route Handler**
```javascript
// Match dengan POST route
router.post('/', recipeController.createRecipe);
```

### **Step 4: Controller Validation**
```javascript
async createRecipe(req, res) {
  try {
    console.log('Controller: Menerima POST request');
    console.log('Data:', req.body);
    
    // 1. Ambil data dari request body
    const recipeData = req.body;
    
    // 2. Panggil service untuk proses business logic
    const result = await recipeService.createRecipe(recipeData);
    
    // 3. Kirim response sukses
    res.status(201).json(result);
  } catch (error) {
    // 4. Handle error
    const statusCode = error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
}
```

### **Step 5: Service Business Logic**
```javascript
async createRecipe(recipeData) {
  console.log('Service: Memproses business logic');
  
  // 1. Validasi input data
  const errors = this.validateRecipeData(recipeData);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }
  
  // 2. Clean/transform data
  const cleanData = {
    title: recipeData.title.trim(),
    description: recipeData.description?.trim() || null,
    ingredients: recipeData.ingredients.trim(),
    instructions: recipeData.instructions.trim()
  };
  
  // 3. Panggil repository untuk save ke database
  const newRecipe = await recipeRepository.create(cleanData);
  
  // 4. Format response
  return {
    success: true,
    message: 'Recipe created successfully',
    data: newRecipe
  };
}
```

### **Step 6: Repository Database Operation**
```javascript
async create(recipeData) {
  console.log('Repository: Menyimpan data ke database');
  
  // 1. Destructure data
  const { title, description, ingredients, instructions } = recipeData;
  
  // 2. Execute INSERT query
  const [result] = await db.query(
    'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
    [title, description, ingredients, instructions]
  );
  
  // 3. Get data yang baru dibuat
  return this.findById(result.insertId);
}
```

### **Step 7: Database Execution**
```sql
-- 1. Insert data baru
INSERT INTO recipes (title, description, ingredients, instructions) 
VALUES ('Gado-gado', 'Salad Indonesia', 'Sayuran, bumbu kacang', 'Rebus sayuran, siram bumbu kacang');

-- 2. Get ID yang baru dibuat
-- insertId = 4

-- 3. Select data yang baru dibuat
SELECT * FROM recipes WHERE id = 4;
```

## 🔍 4. Error Handling Flow

### **Jika Terjadi Error di Setiap Layer:**

#### **1. Database Error**
```javascript
// Repository
async create(recipeData) {
  try {
    const [result] = await db.query('INSERT INTO recipes...');
    return result;
  } catch (error) {
    // Error: Duplicate entry, Connection lost, etc.
    throw error; // Lempar ke Service
  }
}
```

#### **2. Service Error**
```javascript
// Service
async createRecipe(recipeData) {
  try {
    // Validasi gagal
    if (!recipeData.title) {
      throw new Error('Title is required'); // Custom error
    }
    
    return await recipeRepository.create(recipeData);
  } catch (error) {
    throw error; // Lempar ke Controller
  }
}
```

#### **3. Controller Error**
```javascript
// Controller
async createRecipe(req, res) {
  try {
    const result = await recipeService.createRecipe(req.body);
    res.status(201).json(result);
  } catch (error) {
    // Tentukan status code berdasarkan error
    const statusCode = error.message.includes('required') ? 400 : 500;
    
    // Kirim error response ke client
    res.status(statusCode).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
}
```

## 📊 5. Complete Flow Diagram

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│   CLIENT    │    │    ROUTES    │    │ CONTROLLER  │    │   SERVICE   │    │ REPOSITORY   │
│   (Postman) │    │              │    │             │    │             │    │              │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘    └──────────────┘
       │                   │                   │                   │                   │
       │ 1. HTTP Request   │                   │                   │                   │
       ├──────────────────►│                   │                   │                   │
       │                   │ 2. Route Match    │                   │                   │
       │                   ├──────────────────►│                   │                   │
       │                   │                   │ 3. Call Service   │                   │
       │                   │                   ├──────────────────►│                   │
       │                   │                   │                   │ 4. Call Repository│
       │                   │                   │                   ├──────────────────►│
       │                   │                   │                   │                   │ 5. Database
       │                   │                   │                   │                   │    Query
       │                   │                   │                   │                   ├────────┐
       │                   │                   │                   │                   │        │
       │                   │                   │                   │ 6. Return Data    │        │
       │                   │                   │                   │◄──────────────────┤        │
       │                   │                   │ 7. Return Result  │                   │        │
       │                   │                   │◄──────────────────┤                   │        │
       │                   │ 8. HTTP Response  │                   │                   │        │
       │                   │◄──────────────────┤                   │                   │        │
       │ 9. JSON Response  │                   │                   │                   │        │
       │◄──────────────────┤                   │                   │                   │        │
       │                   │                   │                   │                   │◄───────┘
```

## 🎯 6. Kesimpulan

### **Keuntungan Layered Architecture:**

1. **Separation of Concerns**
   - Controller: Handle HTTP
   - Service: Business Logic
   - Repository: Database
   - Model: Data Structure

2. **Easy Testing**
   - Test setiap layer terpisah
   - Mock dependencies dengan mudah

3. **Easy Maintenance**
   - Ubah database? Ganti Repository saja
   - Ubah business logic? Ganti Service saja
   - Ubah API format? Ganti Controller saja

4. **Reusable Code**
   - Service bisa dipanggil dari mana saja
   - Repository bisa digunakan untuk berbagai service

### **Flow Sederhana:**
```
Request → Router → Controller → Service → Repository → Database
Database → Repository → Service → Controller → Response
```

**Setiap layer punya tanggung jawab yang jelas dan tidak campur aduk!** 🎯
