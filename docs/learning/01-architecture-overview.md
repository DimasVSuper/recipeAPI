# 🏗️ Layered Architecture Overview

> **Memahami "Big Picture" dari Arsitektur Berlapis**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Apa itu Layered Architecture dan mengapa digunakan
- ✅ Komponen-komponen utama dalam layered architecture  
- ✅ Bagaimana setiap layer berinteraksi
- ✅ Keuntungan dan trade-offs dari pendekatan ini

## 🤔 Apa itu Layered Architecture?

**Layered Architecture** adalah pola desain yang memisahkan aplikasi menjadi beberapa layer (lapisan) yang memiliki tanggung jawab tertentu. Setiap layer hanya berkomunikasi dengan layer yang berdekatan.

### 📊 Visual Representation

```
┌─────────────────────────────────┐
│         🌐 CLIENT               │
│    (Browser, Mobile App, etc)   │
└─────────────┬───────────────────┘
              │ HTTP Requests
              ▼
┌─────────────────────────────────┐
│      🎛️ CONTROLLER LAYER       │
│   • Handle HTTP requests        │
│   • Route management            │
│   • Input validation            │
│   • Response formatting         │
└─────────────┬───────────────────┘
              │ Business Logic Calls
              ▼
┌─────────────────────────────────┐
│       ⚙️ SERVICE LAYER          │
│   • Business logic             │
│   • Data validation            │
│   • Business rules             │
│   • Cross-cutting concerns     │
└─────────────┬───────────────────┘
              │ Data Access Calls
              ▼
┌─────────────────────────────────┐
│     🗃️ REPOSITORY LAYER        │
│   • Data access logic          │
│   • Database operations        │
│   • Query optimization         │
│   • Data mapping               │
└─────────────┬───────────────────┘
              │ Raw Data
              ▼
┌─────────────────────────────────┐
│        💾 DATABASE              │
│      (MySQL, PostgreSQL)       │
└─────────────────────────────────┘
```

## 🧩 Komponen Utama dalam Recipe API

### 1. **🎛️ Controller Layer**
```javascript
// src/controllers/recipeController.js
class RecipeController {
  async getAllRecipes(req, res, next) {
    // Handle HTTP request
    // Call service layer
    // Format response
  }
}
```

**Tanggung Jawab:**
- ✅ Menerima HTTP requests
- ✅ Validasi input dasar
- ✅ Memanggil service layer
- ✅ Format response JSON
- ✅ Handle HTTP status codes

### 2. **⚙️ Service Layer**
```javascript
// src/services/recipeService.js
class RecipeService {
  async createRecipe(recipeData) {
    // Business logic
    // Data validation
    // Call repository layer
    // Business rules enforcement
  }
}
```

**Tanggung Jawab:**
- ✅ Business logic implementation
- ✅ Data validation & transformation
- ✅ Business rules enforcement
- ✅ Cross-cutting concerns
- ✅ Orchestration between repositories

### 3. **🗃️ Repository Layer**
```javascript
// src/repositories/recipeRepository.js
class RecipeRepository {
  async findAll() {
    // Database query
    // Data mapping
    // Return domain objects
  }
}
```

**Tanggung Jawab:**
- ✅ Data access abstraction
- ✅ Database operations
- ✅ Query optimization
- ✅ Data mapping ke domain objects
- ✅ Database transaction management

### 4. **📋 Model Layer**
```javascript
// src/models/recipeModel.js
class RecipeModel {
  constructor(data) {
    // Data structure definition
    // Validation rules
    // Business entity representation
  }
}
```

**Tanggung Jawab:**
- ✅ Domain object definition
- ✅ Data validation rules
- ✅ Business entity behavior
- ✅ Data transformation methods
- ✅ Schema definition

### 5. **🛡️ Middleware Layer**
```javascript
// src/middleware/
├── cors.js          // Cross-origin handling
├── errorHandler.js  // Error management
├── logger.js        // Request logging
└── validation.js    // Input validation
```

**Tanggung Jawab:**
- ✅ Cross-cutting concerns
- ✅ Request/response interception
- ✅ Security & authentication
- ✅ Logging & monitoring
- ✅ Error handling

## 🔄 Data Flow Example

Mari kita trace sebuah request dari client sampai database:

### **Scenario: User membuat resep baru**

```javascript
// 1. 🌐 CLIENT REQUEST
POST /api/recipes
{
  "title": "Nasi Goreng Spesial",
  "ingredients": ["nasi", "telur", "bawang"],
  "instructions": ["step 1", "step 2"]
}

// 2. 🎛️ CONTROLLER receives request
app.post('/api/recipes', recipeController.createRecipe);

// 3. ⚙️ SERVICE processes business logic
const result = await recipeService.createRecipe(requestData);

// 4. 🗃️ REPOSITORY accesses database
const recipe = await recipeRepository.create(validatedData);

// 5. 💾 DATABASE stores data
INSERT INTO recipes (title, ingredients, instructions) VALUES (...)

// 6. 🔄 RESPONSE flows back
📋 Model → 🗃️ Repository → ⚙️ Service → 🎛️ Controller → 🌐 Client
```

## 💡 Mengapa Menggunakan Layered Architecture?

### ✅ **Advantages**

#### 1. **Separation of Concerns**
```javascript
// ❌ Tanpa layered architecture - everything mixed
app.post('/recipes', (req, res) => {
  // Validation logic
  // Business logic  
  // Database logic
  // Response formatting
  // All in one place! 😱
});

// ✅ Dengan layered architecture - clean separation
Controller → Service → Repository → Database
```

#### 2. **Testability**
```javascript
// Unit test each layer independently
describe('RecipeService', () => {
  it('should validate recipe data', () => {
    // Test only business logic
    // Mock repository layer
  });
});
```

#### 3. **Maintainability**
```javascript
// Easy to change database from MySQL to PostgreSQL
// Only need to modify Repository layer
// Service and Controller remain untouched
```

#### 4. **Scalability**
```javascript
// Easy to add new features
// Clear where to put new business logic
// Consistent structure across features
```

### ⚠️ **Trade-offs**

#### 1. **Complexity**
- More files and folders
- Learning curve for beginners
- Can be overkill for simple apps

#### 2. **Performance**
- Multiple function calls
- More abstraction layers
- Potential overhead

#### 3. **Development Time**
- More boilerplate code
- Need to think about layer boundaries
- Initial setup time

## 🎯 When to Use Layered Architecture?

### ✅ **Good for:**
- 🏢 **Enterprise applications**
- 📈 **Applications that will scale**
- 👥 **Team development**
- 🔄 **Complex business logic**
- 🧪 **Applications requiring extensive testing**

### ❌ **Overkill for:**
- 🚀 **Simple CRUD applications**
- 🏃‍♂️ **Quick prototypes**
- 👤 **Solo developer, simple apps**
- ⏰ **Time-constrained projects**

## 🔍 Recipe API Implementation

Dalam project ini, kita implementasi layered architecture dengan struktur:

```
src/
├── controllers/     # 🎛️ HTTP request handling
├── services/        # ⚙️ Business logic
├── repositories/    # 🗃️ Data access
├── models/          # 📋 Domain objects
├── middleware/      # 🛡️ Cross-cutting concerns
├── routes/          # 🛣️ URL routing
└── config/          # ⚙️ Configuration
```

## 🏋️‍♂️ Exercise

### **Exercise 1: Trace the Flow**
Trace bagaimana request `GET /api/recipes` mengalir melalui setiap layer:

1. Mulai dari route definition
2. Controller method mana yang dipanggil?
3. Service method mana yang dipanggil?
4. Repository method mana yang dipanggil?
5. Bagaimana response dikembalikan?

### **Exercise 2: Layer Responsibility**
Untuk setiap skenario berikut, tentukan layer mana yang bertanggung jawab:

1. Validasi bahwa title tidak boleh kosong
2. Konversi data dari database ke JSON
3. Log setiap incoming request
4. Hash password user
5. Handle database connection error

### **Exercise 3: Identify Violations**
Review kode berikut dan identify layer violations:

```javascript
// recipeController.js
async createRecipe(req, res) {
  // Direct database query in controller? 🤔
  const result = await db.query('INSERT INTO recipes...');
  
  // Business logic in controller? 🤔
  if (result.title.length < 3) {
    return res.status(400).json({error: 'Title too short'});
  }
}
```

## 📚 Further Reading

- [🔄 Data Flow Detail](02-data-flow.md)
- [🎛️ Controller Layer Deep Dive](03-controller-layer.md)
- [⚙️ Service Layer Deep Dive](04-service-layer.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Data Flow →](02-data-flow.md)**

---

*💡 **Tip**: Gambar arsitektur di atas, print dan tempel di dinding sebagai reference! 📌*
