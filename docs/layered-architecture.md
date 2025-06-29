# 🏗️ Layered Architecture - Panduan Lengkap

Dokumentasi ini menjelaskan **Layered Architecture** dari dasar hingga implementasi lengkap pada Recipe API untuk pembelajaran mendalam.

## 📚 **Table of Contents**

1. [Apa itu Layered Architecture?](#apa-itu-layered-architecture)
2. [MVC vs Layered Architecture](#mvc-vs-layered-architecture)
3. [Komponen-komponen Layer](#komponen-komponen-layer)
4. [Flow Data Antar Layer](#flow-data-antar-layer)
5. [Implementasi di Recipe API](#implementasi-di-recipe-api)
6. [Keuntungan & Kerugian](#keuntungan--kerugian)
7. [Best Practices](#best-practices)
8. [Common Mistakes](#common-mistakes)

---

## 🎯 **Apa itu Layered Architecture?**

**Layered Architecture** adalah pattern arsitektur yang **memisahkan aplikasi menjadi layer-layer terpisah** berdasarkan tanggung jawab (responsibility) masing-masing.

### **Konsep Dasar:**
```
┌─────────────────────┐
│   Presentation      │ ← Controllers (HTTP)
├─────────────────────┤
│   Business Logic    │ ← Services 
├─────────────────────┤
│   Data Access       │ ← Repositories
├─────────────────────┤
│   Database          │ ← MySQL/PostgreSQL
└─────────────────────┘
```

### **Prinsip Utama:**
- **Separation of Concerns** - Setiap layer punya tugas spesifik
- **Dependency Direction** - Layer atas depend pada layer bawah
- **Single Responsibility** - Satu layer, satu tanggung jawab
- **Loose Coupling** - Layer tidak saling terikat ketat

---

## 🆚 **MVC vs Layered Architecture**

### **Traditional MVC Pattern:**
```javascript
// MVC Structure
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Controller  │    │    Model    │    │    View     │
│             │    │             │    │             │
│ - Handle    │◄──►│ - Database  │    │ - Template  │
│   HTTP      │    │ - Business  │    │ - UI Render │
│ - Response  │    │   Logic     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Masalah MVC Traditional:**
- ❌ **Model terlalu gemuk** - Campur database + business logic
- ❌ **Controller terlalu kompleks** - Handle validation + HTTP
- ❌ **Sulit testing** - Logic tersebar di berbagai tempat
- ❌ **Sulit maintenance** - Perubahan satu bagian affect yang lain

### **Layered Architecture Pattern:**
```javascript
// Layered Structure
┌─────────────┐
│ Controller  │ ← HANYA HTTP handling
├─────────────┤
│  Service    │ ← HANYA business logic
├─────────────┤
│ Repository  │ ← HANYA database operations
├─────────────┤
│   Model     │ ← HANYA data structure
└─────────────┘
```

**Keuntungan Layered:**
- ✅ **Clear separation** - Setiap layer fokus satu tugas
- ✅ **Easy testing** - Test setiap layer independen
- ✅ **Maintainable** - Ubah satu layer tanpa affect yang lain
- ✅ **Scalable** - Mudah tambah fitur baru

---

## 🧩 **Komponen-komponen Layer**

### **1. Presentation Layer (Controllers)**
```javascript
// src/controllers/recipeController.js
class RecipeController {
  async getAllRecipes(req, res, next) {
    try {
      // ✅ HANYA handle HTTP request/response
      const result = await recipeService.getAllRecipes();
      res.status(200).json(result);
    } catch (error) {
      // ✅ HANYA pass error ke middleware
      next(error);
    }
  }
}
```

**Tanggung Jawab:**
- ✅ Handle HTTP requests/responses
- ✅ Parse request parameters
- ✅ Call appropriate service methods
- ✅ Return HTTP responses
- ❌ **JANGAN:** Business logic
- ❌ **JANGAN:** Database operations
- ❌ **JANGAN:** Data validation

### **2. Business Logic Layer (Services)**
```javascript
// src/services/recipeService.js
class RecipeService {
  async getAllRecipes() {
    try {
      // ✅ Business logic: Get data from repository
      const recipes = await recipeRepository.findAll();
      
      // ✅ Business logic: Transform data
      const transformedRecipes = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || 'No description',
        // ... other transformations
      }));
      
      // ✅ Business logic: Format response
      return {
        success: true,
        message: 'Recipes retrieved successfully',
        data: transformedRecipes
      };
    } catch (error) {
      throw new Error(`Failed to get recipes: ${error.message}`);
    }
  }
}
```

**Tanggung Jawab:**
- ✅ Business rules & logic
- ✅ Data transformation
- ✅ Orchestrate repository calls
- ✅ Handle complex operations
- ✅ Response formatting
- ❌ **JANGAN:** HTTP handling
- ❌ **JANGAN:** Direct database queries

### **3. Data Access Layer (Repositories)**
```javascript
// src/repositories/recipeRepository.js
class RecipeRepository {
  async findAll() {
    // ✅ HANYA database operations
    const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
    return rows;
  }
  
  async findById(id) {
    // ✅ HANYA database operations
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    return rows[0] || null;
  }
  
  async create(recipeData) {
    // ✅ HANYA database operations
    const { title, description, ingredients, instructions } = recipeData;
    const [result] = await db.query(
      'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)',
      [title, description || null, ingredients, instructions]
    );
    return this.findById(result.insertId);
  }
}
```

**Tanggung Jawab:**
- ✅ Database queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Data persistence operations
- ✅ Database connection management
- ✅ Raw data return
- ❌ **JANGAN:** Business logic
- ❌ **JANGAN:** Data transformation
- ❌ **JANGAN:** Response formatting

### **4. Data Model Layer**
```javascript
// src/models/recipeModel.js
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    this.ingredients = data.ingredients || '';
    this.instructions = data.instructions || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }
  
  // ✅ HANYA struktur data dan schema
  static getSchema() {
    return {
      id: 'number',
      title: 'string',
      description: 'string|null',
      ingredients: 'string',
      instructions: 'string',
      created_at: 'datetime',
      updated_at: 'datetime'
    };
  }
}
```

**Tanggung Jawab:**
- ✅ Data structure definition
- ✅ Data validation schemas
- ✅ Data type definitions
- ✅ Field constraints
- ❌ **JANGAN:** Business logic
- ❌ **JANGAN:** Database operations

### **5. Middleware Layer (Cross-cutting Concerns)**
```javascript
// src/middleware/
├── logger.js         ← Request/response logging
├── validation.js     ← Input validation
├── errorHandler.js   ← Error handling
└── cors.js          ← CORS handling
```

**Tanggung Jawab:**
- ✅ Authentication & Authorization
- ✅ Input validation
- ✅ Error handling
- ✅ Logging
- ✅ CORS handling
- ✅ Rate limiting

---

## 🔄 **Flow Data Antar Layer**

### **Request Flow (Top-Down):**
```
1. HTTP Request
   ↓
2. Middleware (CORS, Logger, Validation)
   ↓
3. Controller (HTTP handling)
   ↓
4. Service (Business logic)
   ↓
5. Repository (Database operations)
   ↓
6. Database
```

### **Response Flow (Bottom-Up):**
```
6. Database
   ↓
5. Repository (Raw data)
   ↓
4. Service (Transformed data + business logic)
   ↓
3. Controller (HTTP response)
   ↓
2. Middleware (Error handling, logging)
   ↓
1. HTTP Response
```

### **Contoh Lengkap - GET Recipe by ID:**

#### **Step 1: HTTP Request**
```http
GET /api/recipes/1
```

#### **Step 2: Middleware Stack**
```javascript
// 1. CORS middleware
app.use(cors); // Handle cross-origin

// 2. Logger middleware  
app.use(logger); // Log request details

// 3. Validation middleware
router.get('/:id', validateId, recipeController.getRecipeById);
// validateId checks if ID is valid number
```

#### **Step 3: Controller**
```javascript
async getRecipeById(req, res, next) {
  try {
    // Hanya call service, tidak ada logic
    const result = await recipeService.getRecipeById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error); // Pass ke error handler middleware
  }
}
```

#### **Step 4: Service**
```javascript
async getRecipeById(id) {
  try {
    // Business logic: validate ID
    if (!id || isNaN(id)) {
      throw new Error('Invalid recipe ID');
    }

    // Call repository
    const recipe = await recipeRepository.findById(parseInt(id));
    
    // Business logic: check if found
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Business logic: transform response
    return {
      success: true,
      message: 'Recipe retrieved successfully',
      data: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || 'No description',
        // ... other fields
      }
    };
  } catch (error) {
    throw error;
  }
}
```

#### **Step 5: Repository**
```javascript
async findById(id) {
  // Hanya database operation
  const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
  return rows[0] || null;
}
```

#### **Step 6: Database Query**
```sql
SELECT * FROM recipes WHERE id = 1;
```

---

## 💼 **Implementasi di Recipe API**

### **Struktur Folder:**
```
src/
├── controllers/
│   └── recipeController.js    ← Presentation Layer
├── services/
│   └── recipeService.js       ← Business Logic Layer
├── repositories/
│   └── recipeRepository.js    ← Data Access Layer
├── models/
│   └── recipeModel.js         ← Data Model Layer
├── middleware/
│   ├── logger.js             ← Cross-cutting: Logging
│   ├── validation.js         ← Cross-cutting: Validation
│   ├── errorHandler.js       ← Cross-cutting: Error handling
│   └── cors.js              ← Cross-cutting: CORS
├── routes/
│   └── recipeRoutes.js       ← Route definitions
└── config/
    └── db.js                 ← Database configuration
```

### **Dependency Injection Pattern:**
```javascript
// Each layer depends on the layer below it

Controller depends on → Service
Service depends on → Repository  
Repository depends on → Database Config
```

### **Error Handling Strategy:**
```javascript
// Error flows upward through layers
Database Error → Repository → Service → Controller → Error Middleware → Client

// Each layer can:
// 1. Handle the error (transform/log)
// 2. Pass it up (throw/next)
// 3. Add context information
```

---

## ✅ **Keuntungan & Kerugian**

### **✅ Keuntungan:**

#### **1. Maintainability**
```javascript
// Ganti database dari MySQL ke MongoDB?
// Hanya ubah Repository layer, Service & Controller tidak berubah

// Ganti business logic?
// Hanya ubah Service layer, Controller & Repository tidak berubah

// Ganti API format?
// Hanya ubah Controller layer, Service & Repository tidak berubah
```

#### **2. Testability**
```javascript
// Test Service layer without database
const mockRepository = {
  findById: jest.fn().mockResolvedValue(mockRecipe)
};

// Test Controller without business logic
const mockService = {
  getRecipeById: jest.fn().mockResolvedValue(mockResponse)
};
```

#### **3. Scalability**
```javascript
// Mudah tambah layer baru:
├── caching/           ← Caching layer
├── validation/        ← Advanced validation
├── security/          ← Security layer
└── monitoring/        ← Monitoring layer
```

#### **4. Team Development**
```javascript
// Tim bisa kerja parallel:
Frontend Dev → Work on API contracts
Backend Dev → Work on Controllers  
DB Dev → Work on Repositories
Business Analyst → Work on Services
```

### **❌ Kerugian:**

#### **1. Complexity**
```javascript
// Simple CRUD jadi banyak file:
recipeController.js
recipeService.js
recipeRepository.js
recipeModel.js
// vs simple MVC: recipeController.js + recipeModel.js
```

#### **2. Over-engineering**
```javascript
// Untuk aplikasi kecil, mungkin overkill
// Simple blog with 3 tables tidak perlu architecture kompleks
```

#### **3. Learning Curve**
```javascript
// Developer junior perlu waktu untuk understand:
// - Dependency injection
// - Layer responsibilities  
// - Data flow patterns
```

---

## 🎯 **Best Practices**

### **1. Layer Isolation**
```javascript
// ✅ GOOD: Layer hanya import layer di bawahnya
class RecipeController {
  constructor() {
    this.recipeService = require('../services/recipeService');
  }
}

// ❌ BAD: Controller langsung import Repository
class RecipeController {
  constructor() {
    this.recipeRepository = require('../repositories/recipeRepository'); // JANGAN!
  }
}
```

### **2. Error Handling**
```javascript
// ✅ GOOD: Consistent error handling
class RecipeService {
  async getRecipeById(id) {
    try {
      const recipe = await this.recipeRepository.findById(id);
      if (!recipe) {
        throw new Error('Recipe not found'); // Descriptive error
      }
      return recipe;
    } catch (error) {
      // Log error with context
      console.error(`RecipeService.getRecipeById failed for ID ${id}:`, error);
      throw error; // Re-throw to upper layer
    }
  }
}
```

### **3. Data Transformation**
```javascript
// ✅ GOOD: Transform data di Service layer
class RecipeService {
  formatRecipeResponse(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description || 'No description available',
      createdAt: new Date(recipe.created_at).toISOString(),
      // Business logic transformations here
    };
  }
}

// ❌ BAD: Transform data di Controller
class RecipeController {
  async getRecipe(req, res) {
    const recipe = await recipeService.getRecipeById(req.params.id);
    // JANGAN transform data di sini!
    recipe.description = recipe.description || 'No description';
    res.json(recipe);
  }
}
```

### **4. Dependency Injection**
```javascript
// ✅ GOOD: Inject dependencies through constructor
class RecipeService {
  constructor(recipeRepository = require('../repositories/recipeRepository')) {
    this.recipeRepository = recipeRepository;
  }
  
  async getAllRecipes() {
    return await this.recipeRepository.findAll();
  }
}

// Easy to test with mocks
const mockRepository = { findAll: jest.fn() };
const recipeService = new RecipeService(mockRepository);
```

### **5. Interface Consistency**
```javascript
// ✅ GOOD: Consistent method naming across layers
Controller: getAllRecipes() → Service: getAllRecipes() → Repository: findAll()
Controller: getRecipeById() → Service: getRecipeById() → Repository: findById()
Controller: createRecipe() → Service: createRecipe() → Repository: create()
```

---

## 🚨 **Common Mistakes**

### **1. Fat Services**
```javascript
// ❌ BAD: Service terlalu gemuk
class RecipeService {
  async createRecipe(data) {
    // Validation logic
    if (!data.title) throw new Error('Title required');
    if (!data.ingredients) throw new Error('Ingredients required');
    
    // Business logic
    const processedData = this.processRecipeData(data);
    
    // Database logic
    const query = 'INSERT INTO recipes (title, ingredients) VALUES (?, ?)';
    const result = await db.query(query, [data.title, data.ingredients]);
    
    // Email logic
    await this.sendNotificationEmail(data);
    
    // Cache logic
    await this.invalidateCache();
    
    return result;
  }
}

// ✅ GOOD: Pisahkan responsibilities
class RecipeService {
  async createRecipe(data) {
    // Hanya business logic
    const processedData = this.processRecipeData(data);
    const recipe = await this.recipeRepository.create(processedData);
    
    // Delegate ke services lain
    await this.emailService.sendNotification(recipe);
    await this.cacheService.invalidate('recipes');
    
    return recipe;
  }
}
```

### **2. Layer Skipping**
```javascript
// ❌ BAD: Controller langsung ke Repository
class RecipeController {
  async getRecipes(req, res) {
    const recipes = await recipeRepository.findAll(); // Skip service layer!
    res.json(recipes);
  }
}

// ✅ GOOD: Ikuti layer hierarchy
class RecipeController {
  async getRecipes(req, res) {
    const result = await recipeService.getAllRecipes(); // Through service
    res.json(result);
  }
}
```

### **3. Circular Dependencies**
```javascript
// ❌ BAD: Circular dependency
// userService.js
const postService = require('./postService');

// postService.js  
const userService = require('./userService'); // CIRCULAR!

// ✅ GOOD: Use shared layer or events
// userService.js
const eventEmitter = require('../events/eventEmitter');

// postService.js
eventEmitter.on('userCreated', (user) => {
  // Handle user creation
});
```

### **4. Business Logic di Controller**
```javascript
// ❌ BAD: Business logic di Controller
class RecipeController {
  async createRecipe(req, res) {
    // Business logic di Controller - JANGAN!
    if (req.body.title.length < 3) {
      return res.status(400).json({ error: 'Title too short' });
    }
    
    if (req.body.category === 'premium' && !req.user.isPremium) {
      return res.status(403).json({ error: 'Premium required' });
    }
    
    const recipe = await recipeService.createRecipe(req.body);
    res.json(recipe);
  }
}

// ✅ GOOD: Business logic di Service/Middleware
class RecipeController {
  async createRecipe(req, res) {
    // Hanya HTTP handling
    const result = await recipeService.createRecipe(req.body, req.user);
    res.status(201).json(result);
  }
}
```

---

## 🚀 **Kesimpulan**

**Layered Architecture** adalah pattern yang **sangat powerful** untuk aplikasi backend yang:
- ✅ **Maintainable** - Easy to modify and extend
- ✅ **Testable** - Each layer can be tested independently  
- ✅ **Scalable** - Easy to add new features
- ✅ **Professional** - Industry standard pattern

### **Kapan Menggunakan Layered Architecture:**
- ✅ **Medium to large applications**
- ✅ **Team development** (multiple developers)
- ✅ **Long-term maintenance**
- ✅ **Complex business logic**
- ✅ **Multiple data sources**

### **Kapan TIDAK Menggunakan:**
- ❌ **Simple CRUD applications** (overkill)
- ❌ **Prototypes/MVPs** (too much overhead)
- ❌ **Solo developer + tight deadline**

### **Key Takeaways:**

1. **Separation of Concerns** adalah prinsip utama
2. **Setiap layer punya tanggung jawab spesifik**
3. **Dependencies flow downward** (Controller → Service → Repository)
4. **Errors bubble upward** (Database → Repository → Service → Controller)
5. **Middleware handle cross-cutting concerns**

**Dengan memahami Layered Architecture, kamu sudah siap mengembangkan aplikasi backend yang professional dan scalable!** 🎯

---

## 📚 **Next Steps untuk Learning:**

1. **Practice** - Implement UPDATE & DELETE operations
2. **Authentication** - Add JWT authentication layer
3. **Caching** - Add Redis caching layer
4. **Testing** - Write unit tests for each layer
5. **Monitoring** - Add logging and metrics
6. **Microservices** - Scale to multiple services

**Keep building, keep learning!** 🚀🔥
