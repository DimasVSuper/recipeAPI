# 🏗️ Repository-Model Relationship Documentation

> **Dokumentasi hubungan antara Repository dan Model dalam Recipe API**

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Konsep Dasar](#konsep-dasar)
3. [Struktur Arsitektur](#struktur-arsitektur)
4. [Model Layer](#model-layer)
5. [Repository Layer](#repository-layer)
6. [Service Layer](#service-layer)
7. [Data Flow](#data-flow)
8. [Best Practices](#best-practices)
9. [Contoh Implementasi](#contoh-implementasi)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Repository-Model relationship adalah pola arsitektur yang memisahkan concerns antara:
- **Model**: Mendefinisikan struktur data dan business rules
- **Repository**: Menangani operasi database dan data persistence
- **Service**: Mengatur business logic dan koordinasi antar layer

### ✅ Manfaat Implementasi:
- **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas
- **Testability**: Mudah untuk unit testing
- **Maintainability**: Kode lebih mudah di-maintain dan di-refactor
- **Scalability**: Mudah untuk menambah fitur baru
- **Data Consistency**: Validasi terpusat melalui Model

---

## 💡 Konsep Dasar

### 🔄 **Model**
```javascript
// Model bertanggung jawab untuk:
- Struktur data (schema)
- Validasi data
- Transformasi data
- Business rules
- Data formatting
```

### 🗄️ **Repository**
```javascript
// Repository bertanggung jawab untuk:
- Database operations (CRUD)
- Query execution
- Data persistence
- Raw data handling
- Connection management
```

### ⚙️ **Service**
```javascript
// Service bertanggung jawab untuk:
- Business logic
- Data orchestration
- Error handling
- Response formatting
- Integration dengan external services
```

---

## 🏛️ Struktur Arsitektur

```
┌─────────────────┐
│   Controller    │ ← HTTP Request/Response
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Service      │ ← Business Logic
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Repository    │───▶│     Model       │
└─────────────────┘    └─────────────────┘
         │                      ▲
         ▼                      │
┌─────────────────┐             │
│    Database     │─────────────┘
└─────────────────┘
```

### 🔄 **Data Flow:**
1. **Controller** menerima HTTP request
2. **Controller** memanggil **Service**
3. **Service** memproses business logic
4. **Service** memanggil **Repository**
5. **Repository** menggunakan **Model** untuk validasi
6. **Repository** melakukan operasi database
7. **Repository** return data dalam bentuk **Model instance**
8. **Service** memformat response
9. **Controller** mengirim response ke client

---

## 📊 Model Layer

### 📁 File: `src/models/recipeModel.js`

```javascript
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

  // Static methods untuk schema definition
  static getSchema() { /* ... */ }
  static getRequiredFields() { /* ... */ }

  // Instance methods untuk data manipulation
  validate() { /* ... */ }
  toJSON() { /* ... */ }
  toDatabase() { /* ... */ }
}
```

### 🎯 **Fungsi Model:**

#### 1. **Data Structure Definition**
```javascript
// Mendefinisikan struktur data yang konsisten
constructor(data = {}) {
  this.id = data.id || null;
  this.title = data.title || '';
  // ... fields lainnya
}
```

#### 2. **Schema Validation**
```javascript
static getSchema() {
  return {
    id: 'number',
    title: 'string',
    ingredients: 'array',
    // ... field types lainnya
  };
}
```

#### 3. **Business Rules Validation**
```javascript
validate() {
  const errors = [];
  
  // Required field validation
  if (!this.title || this.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  // Type validation
  if (!Array.isArray(this.ingredients)) {
    errors.push('Ingredients must be an array');
  }
  
  return errors;
}
```

#### 4. **Data Transformation**
```javascript
// Untuk response ke client
toJSON() {
  return {
    id: this.id,
    title: this.title,
    // ... formatted data
  };
}

// Untuk save ke database
toDatabase() {
  return {
    title: this.title?.trim(),
    ingredients: Array.isArray(this.ingredients) ? this.ingredients : [],
    // ... cleaned data
  };
}
```

---

## 🗄️ Repository Layer

### 📁 File: `src/repositories/recipeRepository.js`

```javascript
const RecipeModel = require('../models/recipeModel');

class RecipeRepository {
  // Database operations menggunakan Model
  async findAll() {
    const [rows] = await db.query('SELECT * FROM recipes');
    
    // Transform raw database result ke Model instances
    return rows.map(row => {
      const parsedRow = {
        ...row,
        ingredients: JSON.parse(row.ingredients),
        instructions: JSON.parse(row.instructions)
      };
      return new RecipeModel(parsedRow);
    });
  }

  async create(recipeData) {
    // Validasi menggunakan Model
    const errors = this.validateWithModel(recipeData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Database operation
    const [result] = await db.query(/* SQL INSERT */);
    
    // Return Model instance
    return this.findById(result.insertId);
  }
}
```

### 🎯 **Fungsi Repository:**

#### 1. **Data Access Layer**
```javascript
// Handle semua operasi database
async findAll() { /* SELECT operations */ }
async findById(id) { /* SELECT dengan WHERE */ }
async create(data) { /* INSERT operations */ }
async update(id, data) { /* UPDATE operations */ }
async delete(id) { /* DELETE operations */ }
```

#### 2. **Model Integration**
```javascript
// Transform database result ke Model
return rows.map(row => new RecipeModel(row));

// Validasi menggunakan Model schema
const errors = this.validateWithModel(data);
```

#### 3. **Data Parsing & Formatting**
```javascript
// Parse JSON strings from database
const parsedRow = {
  ...row,
  ingredients: JSON.parse(row.ingredients),
  instructions: JSON.parse(row.instructions)
};
```

#### 4. **Validation Integration**
```javascript
validateWithModel(data) {
  const errors = [];
  const requiredFields = RecipeModel.getRequiredFields();
  const schema = RecipeModel.getSchema();
  
  // Validate using Model definition
  // ... validation logic
  
  return errors;
}
```

---

## ⚙️ Service Layer

### 📁 File: `src/services/recipeService.js`

```javascript
const recipeRepository = require('../repositories/recipeRepository');
const RecipeModel = require('../models/recipeModel');

class RecipeService {
  async createRecipe(recipeData) {
    try {
      // Business logic: Create Model instance untuk validasi
      const recipeModel = new RecipeModel(recipeData);
      const validationErrors = recipeModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Transform data menggunakan Model
      const cleanData = recipeModel.toDatabase();
      
      // Call Repository
      const newRecipe = await recipeRepository.create(cleanData);

      // Format response
      return {
        success: true,
        message: 'Recipe created successfully',
        data: newRecipe.toJSON()  // Model instance method
      };
    } catch (error) {
      throw error;
    }
  }
}
```

### 🎯 **Fungsi Service:**

#### 1. **Business Logic**
```javascript
// Validasi ID
if (!id || isNaN(id)) {
  throw new Error('Invalid recipe ID');
}

// Check existing data
const existingRecipe = await recipeRepository.findById(id);
if (!existingRecipe) {
  throw new Error('Recipe not found');
}
```

#### 2. **Model Coordination**
```javascript
// Create Model instance untuk validasi
const recipeModel = new RecipeModel(recipeData);
const validationErrors = recipeModel.validate();

// Transform data untuk database
const cleanData = recipeModel.toDatabase();
```

#### 3. **Response Formatting**
```javascript
return {
  success: true,
  message: 'Operation successful',
  data: recipe.toJSON()  // Uses Model method
};
```

---

## 🔄 Data Flow

### 📥 **CREATE Operation Flow:**

```
1. Client Request (POST /api/recipes)
   ↓
2. Controller → recipeController.createRecipe()
   ↓
3. Service → recipeService.createRecipe(data)
   ├─ Create RecipeModel instance
   ├─ Validate using model.validate()
   ├─ Transform using model.toDatabase()
   ↓
4. Repository → recipeRepository.create(cleanData)
   ├─ Validate using validateWithModel()
   ├─ Execute SQL INSERT
   ├─ Return new RecipeModel instance
   ↓
5. Service → Format response
   ├─ Use newRecipe.toJSON()
   ↓
6. Controller → Send HTTP response
```

### 📤 **READ Operation Flow:**

```
1. Client Request (GET /api/recipes/:id)
   ↓
2. Controller → recipeController.getRecipeById(id)
   ↓
3. Service → recipeService.getRecipeById(id)
   ├─ Validate ID
   ↓
4. Repository → recipeRepository.findById(id)
   ├─ Execute SQL SELECT
   ├─ Parse database result
   ├─ Return RecipeModel instance
   ↓
5. Service → Format response
   ├─ Use recipe.toJSON()
   ↓
6. Controller → Send HTTP response
```

---

## ✅ Best Practices

### 1. **Model Design**
```javascript
✅ DO:
- Definisikan clear schema
- Implement validation methods
- Provide transformation methods
- Keep business rules in Model

❌ DON'T:
- Put database operations in Model
- Make Model dependent on external services
- Mix presentation logic with data logic
```

### 2. **Repository Design**
```javascript
✅ DO:
- Focus on data access only
- Use Model for data formatting
- Handle database connections
- Implement proper error handling

❌ DON'T:
- Put business logic in Repository
- Return raw database results
- Handle HTTP requests/responses
- Implement presentation logic
```

### 3. **Service Design**
```javascript
✅ DO:
- Implement business logic
- Coordinate between layers
- Handle complex validations
- Format responses properly

❌ DON'T:
- Write SQL queries directly
- Handle database connections
- Return unformatted data
- Skip error handling
```

### 4. **Data Validation**
```javascript
✅ DO:
- Validate at Model level (schema validation)
- Validate at Service level (business rules)
- Validate at Repository level (data integrity)

❌ DON'T:
- Skip validation at any level
- Duplicate validation logic
- Assume data is always valid
```

---

## 💻 Contoh Implementasi

### **Scenario: Membuat Recipe Baru**

#### 1. **Client Request:**
```javascript
POST /api/recipes
Content-Type: application/json

{
  "title": "Nasi Goreng Spesial",
  "description": "Nasi goreng dengan bumbu rahasia",
  "ingredients": ["nasi", "telur", "bawang", "kecap"],
  "instructions": ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"]
}
```

#### 2. **Controller Processing:**
```javascript
// recipeController.js
async createRecipe(req, res, next) {
  try {
    const result = await recipeService.createRecipe(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

#### 3. **Service Business Logic:**
```javascript
// recipeService.js
async createRecipe(recipeData) {
  // Create Model instance
  const recipeModel = new RecipeModel(recipeData);
  
  // Validate using Model
  const errors = recipeModel.validate();
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }
  
  // Transform for database
  const cleanData = recipeModel.toDatabase();
  
  // Call Repository
  const newRecipe = await recipeRepository.create(cleanData);
  
  // Return formatted response
  return {
    success: true,
    message: 'Recipe created successfully',
    data: newRecipe.toJSON()
  };
}
```

#### 4. **Repository Data Access:**
```javascript
// recipeRepository.js
async create(recipeData) {
  // Validate with Model schema
  const errors = this.validateWithModel(recipeData);
  if (errors.length > 0) {
    throw new Error(`Data validation failed: ${errors.join(', ')}`);
  }
  
  // Database operation
  const { title, description, ingredients, instructions } = recipeData;
  const [result] = await db.query(
    'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
    [title, description, JSON.stringify(ingredients), JSON.stringify(instructions)]
  );
  
  // Return Model instance
  return this.findById(result.insertId);
}
```

#### 5. **Model Data Handling:**
```javascript
// recipeModel.js
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    this.ingredients = data.ingredients || [];
    this.instructions = data.instructions || [];
    // ...
  }
  
  validate() {
    const errors = [];
    
    if (!this.title || this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (!Array.isArray(this.ingredients) || this.ingredients.length === 0) {
      errors.push('Ingredients are required and must be an array');
    }
    
    return errors;
  }
  
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
  
  toDatabase() {
    return {
      title: this.title?.trim(),
      description: this.description?.trim() || null,
      ingredients: Array.isArray(this.ingredients) ? this.ingredients : [],
      instructions: Array.isArray(this.instructions) ? this.instructions : []
    };
  }
}
```

#### 6. **Response to Client:**
```javascript
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 1,
    "title": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan bumbu rahasia",
    "ingredients": ["nasi", "telur", "bawang", "kecap"],
    "instructions": ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"],
    "created_at": "2025-06-30T10:30:00.000Z",
    "updated_at": "2025-06-30T10:30:00.000Z"
  }
}
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions:**

#### 1. **Model Validation Errors**
```javascript
❌ Problem: "Validation errors: title is required"

✅ Solution:
- Check if data is properly passed to Model constructor
- Verify required fields are not empty
- Ensure data types match schema definition
```

#### 2. **Repository Database Errors**
```javascript
❌ Problem: "Data validation failed: ingredients must be an array"

✅ Solution:
- Check data transformation in Service layer
- Verify Model.toDatabase() method
- Ensure proper JSON parsing in Repository
```

#### 3. **Service Layer Errors**
```javascript
❌ Problem: "Cannot read property 'toJSON' of null"

✅ Solution:
- Check if Repository returns Model instance
- Verify findById() returns proper data
- Handle null/undefined cases properly
```

#### 4. **JSON Parsing Errors**
```javascript
❌ Problem: "Unexpected token in JSON"

✅ Solution:
- Verify database stores proper JSON format
- Check JSON.stringify() in Repository create/update
- Handle malformed JSON data gracefully
```

---

## 📚 Referensi

### **Files Location:**
- Model: `src/models/recipeModel.js`
- Repository: `src/repositories/recipeRepository.js`
- Service: `src/services/recipeService.js`
- Controller: `src/controllers/recipeController.js`

### **Related Documentation:**
- [API Documentation](api-docs.md)
- [Layered Architecture](layered-architecture.md)
- [Error Handling](error-handling.md)
- [Folder Structure](folder-structure.md)

---

## 🎯 Kesimpulan

Repository-Model relationship dalam Recipe API memberikan:

✅ **Clear Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas
✅ **Data Consistency**: Validasi terpusat melalui Model
✅ **Maintainable Code**: Mudah untuk modifikasi dan debugging
✅ **Testable Architecture**: Setiap layer dapat di-test secara independen
✅ **Scalable Design**: Mudah untuk menambah fitur baru

**Best Practice Summary:**
- Model → Data structure, validation, transformation
- Repository → Database operations, data access
- Service → Business logic, orchestration
- Controller → HTTP handling, routing

---

> **"Good architecture is not about perfection, it's about clear separation of concerns and maintainable code."**

🚀 **Happy Coding!**
