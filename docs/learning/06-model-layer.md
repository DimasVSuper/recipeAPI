# 06 - Model Layer & Data Validation

> **Chapter 6: Deep Dive into Model Layer - Data Validation, Transformation & Business Rules**

## 📋 Chapter Overview

Model Layer adalah foundation dari aplikasi yang bertanggung jawab untuk:
- **Data validation** (format, type, business rules)
- **Data transformation** (parsing, serialization)
- **Business domain representation** (entities, value objects)
- **Data integrity** (constraints, relationships)

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Memahami peran Model dalam layered architecture
- ✅ Implementasi comprehensive data validation
- ✅ Membuat reusable transformation methods
- ✅ Apply business rules di model level
- ✅ Handle edge cases dan error scenarios

## 🏗️ Model Layer Architecture

### **Position in Architecture**
```
┌─────────────────┐
│   Controller    │ ← HTTP handling
├─────────────────┤
│    Service      │ ← Business logic
├─────────────────┤
│   Repository    │ ← Data access
├─────────────────┤
│ 🎯 MODEL LAYER │ ← Data validation & transformation
├─────────────────┤
│    Database     │ ← Data storage
└─────────────────┘
```

### **Core Responsibilities**
1. **Data Validation**: Memastikan data sesuai business rules
2. **Data Transformation**: Convert antara format yang berbeda
3. **Business Rules**: Enforce domain constraints
4. **Data Integrity**: Maintain consistency

## 🔍 Real Implementation Analysis

Mari kita analyze implementasi `RecipeModel` di project ini:

```javascript
// src/models/recipeModel.js - Real Implementation
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

  // Schema definition untuk validation
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

  // Required fields untuk business rules
  static getRequiredFields() {
    return ['title', 'ingredients', 'instructions'];
  }

  // Data validation dengan business rules
  validate() {
    const errors = [];
    const requiredFields = RecipeModel.getRequiredFields();

    // Required field validation
    requiredFields.forEach(field => {
      if (!this[field] || (Array.isArray(this[field]) && this[field].length === 0)) {
        errors.push(`${field} is required`);
      }
    });

    // Business rules validation
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

  // Transform untuk output (API response)
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

  // Transform untuk database storage
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
```

## 📊 Model Layer Patterns

### **1. Data Validation Pattern**
```javascript
// ✅ GOOD: Comprehensive validation dengan clear messages
validate() {
  const errors = [];
  
  // Required validation
  if (!this.title?.trim()) {
    errors.push('Title is required and cannot be empty');
  }
  
  // Business rules validation
  if (this.title && this.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  // Type validation
  if (this.ingredients && !Array.isArray(this.ingredients)) {
    errors.push('Ingredients must be an array');
  }
  
  return errors;
}

// ❌ BAD: Minimal validation
validate() {
  return this.title ? [] : ['Invalid'];
}
```

### **2. Data Transformation Pattern**
```javascript
// ✅ GOOD: Specific transformation methods
toJSON() {
  return {
    id: this.id,
    title: this.title,
    description: this.description,
    // ... clean API response format
  };
}

toDatabase() {
  return {
    id: this.id,
    title: this.title?.trim(),
    description: this.description?.trim() || null,
    // ... database-ready format
  };
}

// ❌ BAD: Generic transformation
toString() {
  return JSON.stringify(this);
}
```

### **3. Schema Definition Pattern**
```javascript
// ✅ GOOD: Clear schema dengan types
static getSchema() {
  return {
    id: 'number',
    title: 'string',
    description: 'string|null',
    ingredients: 'array',
    instructions: 'array'
  };
}

static getRequiredFields() {
  return ['title', 'ingredients', 'instructions'];
}

// ❌ BAD: Implicit schema
// No clear definition of expected structure
```

## 🔄 Model Usage in Other Layers

### **In Repository Layer**
```javascript
// src/repositories/recipeRepository.js
async create(recipeData) {
  // Model digunakan untuk validation & transformation
  const recipe = new RecipeModel(recipeData);
  
  // Validate before database operation
  const errors = recipe.validate();
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  // Transform untuk database
  const dbData = recipe.toDatabase();
  const result = await this.db.query(sql, [dbData.title, ...]);
  
  // Return sebagai Model instance
  return new RecipeModel({
    id: result.insertId,
    ...dbData
  });
}
```

### **In Service Layer**
```javascript
// src/services/recipeService.js
async createRecipe(recipeData) {
  try {
    // Model untuk validation
    const recipe = new RecipeModel(recipeData);
    const errors = recipe.validate();
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    // Business logic
    const savedRecipe = await this.recipeRepository.create(recipe.toDatabase());
    
    // Return dalam format yang consistent
    return savedRecipe.toJSON();
  } catch (error) {
    throw error;
  }
}
```

## 🧪 Testing Model Layer

### **Unit Test Example**
```javascript
// tests/unit/recipeModel.test.js
describe('RecipeModel Validation', () => {
  test('should validate required fields', () => {
    const recipe = new RecipeModel({});
    const errors = recipe.validate();
    
    expect(errors).toContain('title is required');
    expect(errors).toContain('ingredients is required');
    expect(errors).toContain('instructions is required');
  });

  test('should validate business rules', () => {
    const recipe = new RecipeModel({
      title: 'Hi',  // Too short
      ingredients: ['salt'],
      instructions: ['cook']
    });
    
    const errors = recipe.validate();
    expect(errors).toContain('Title must be at least 3 characters');
  });

  test('should transform data correctly', () => {
    const recipe = new RecipeModel({
      title: '  Pasta Recipe  ',
      description: '  Delicious pasta  ',
      ingredients: ['pasta', 'sauce'],
      instructions: ['boil', 'serve']
    });

    const dbData = recipe.toDatabase();
    expect(dbData.title).toBe('Pasta Recipe');
    expect(dbData.description).toBe('Delicious pasta');
  });
});
```

## 🎯 Advanced Model Patterns

### **1. Static Factory Methods**
```javascript
class RecipeModel {
  // Factory method untuk create dari database result
  static fromDatabase(dbRow) {
    return new RecipeModel({
      id: dbRow.id,
      title: dbRow.title,
      description: dbRow.description,
      ingredients: typeof dbRow.ingredients === 'string' 
        ? JSON.parse(dbRow.ingredients) 
        : dbRow.ingredients,
      instructions: typeof dbRow.instructions === 'string'
        ? JSON.parse(dbRow.instructions)
        : dbRow.instructions,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    });
  }

  // Factory method untuk create dari API request
  static fromRequest(requestBody) {
    return new RecipeModel({
      title: requestBody.title?.trim(),
      description: requestBody.description?.trim(),
      ingredients: Array.isArray(requestBody.ingredients) 
        ? requestBody.ingredients 
        : [],
      instructions: Array.isArray(requestBody.instructions)
        ? requestBody.instructions
        : []
    });
  }
}
```

### **2. Advanced Validation**
```javascript
class RecipeModel {
  validate() {
    const errors = [];
    
    // Basic validation
    this.validateRequired(errors);
    this.validateTypes(errors);
    this.validateBusinessRules(errors);
    
    return errors;
  }

  validateRequired(errors) {
    const required = RecipeModel.getRequiredFields();
    required.forEach(field => {
      if (!this[field] || (Array.isArray(this[field]) && this[field].length === 0)) {
        errors.push(`${field} is required`);
      }
    });
  }

  validateTypes(errors) {
    if (this.ingredients && !Array.isArray(this.ingredients)) {
      errors.push('Ingredients must be an array');
    }
    if (this.instructions && !Array.isArray(this.instructions)) {
      errors.push('Instructions must be an array');
    }
  }

  validateBusinessRules(errors) {
    if (this.title && this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (this.title && this.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }
  }
}
```

### **3. Data Sanitization**
```javascript
class RecipeModel {
  sanitize() {
    // Trim strings
    if (this.title) this.title = this.title.trim();
    if (this.description) this.description = this.description.trim();
    
    // Ensure arrays
    if (!Array.isArray(this.ingredients)) this.ingredients = [];
    if (!Array.isArray(this.instructions)) this.instructions = [];
    
    // Remove empty items from arrays
    this.ingredients = this.ingredients.filter(item => item && item.trim());
    this.instructions = this.instructions.filter(item => item && item.trim());
    
    return this;
  }
}
```

## 🚨 Common Pitfalls & Solutions

### **❌ Pitfall 1: Fat Models**
```javascript
// BAD: Model dengan terlalu banyak responsibility
class RecipeModel {
  constructor(data) { /* ... */ }
  
  // ❌ Database operations dalam model
  async save() {
    const db = require('../config/db');
    return await db.query('INSERT INTO recipes...', [this.title]);
  }
  
  // ❌ HTTP operations dalam model
  async sendNotification() {
    const axios = require('axios');
    return await axios.post('/notify', this.toJSON());
  }
}
```

**✅ Solution: Single Responsibility**
```javascript
// GOOD: Model fokus pada data validation & transformation
class RecipeModel {
  constructor(data) { /* ... */ }
  validate() { /* ... */ }
  toJSON() { /* ... */ }
  toDatabase() { /* ... */ }
}

// Database operations di Repository
// HTTP operations di Service
```
