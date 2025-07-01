# 🔄 Data Flow & Request Lifecycle

> **Memahami Perjalanan Data dari Client sampai Database**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Bagaimana request mengalir melalui setiap layer
- ✅ Transformation data di setiap tahap
- ✅ Error handling di sepanjang flow
- ✅ Performance considerations dalam data flow
- ✅ Debugging techniques untuk trace request flow

## 🌊 Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    🌐 CLIENT                           │
│              (Browser, Mobile, Postman)                │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 🛡️ MIDDLEWARE STACK                    │
│  ┌─────────────┬─────────────┬─────────────┬──────────┐ │
│  │    CORS     │   Logger    │ JSON Parser │   Auth   │ │
│  │   Headers   │  Request    │   Body      │  Token   │ │
│  └─────────────┴─────────────┴─────────────┴──────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │ Processed Request
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  🎛️ CONTROLLER LAYER                   │
│  • Extract params, query, body                         │
│  • Basic validation                                    │
│  • Route to appropriate method                         │
└─────────────────────┬───────────────────────────────────┘
                      │ Structured Data
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   ⚙️ SERVICE LAYER                     │
│  • Business logic validation                           │
│  • Data transformation                                 │
│  • Business rules enforcement                          │
│  • Orchestrate repository calls                       │
└─────────────────────┬───────────────────────────────────┘
                      │ Validated Business Data
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  🗃️ REPOSITORY LAYER                   │
│  • Data access abstraction                             │
│  • SQL query construction                              │
│  • Database operations                                 │
│  • Map DB results to Models                            │
└─────────────────────┬───────────────────────────────────┘
                      │ Database Query
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     💾 DATABASE                        │
│  • Store/Retrieve data                                 │
│  • Constraints validation                              │
│  • Transaction management                              │
└─────────────────────┬───────────────────────────────────┘
                      │ Raw Database Results
                      ▼
┌─────────────────────────────────────────────────────────┐
│               📋 MODEL TRANSFORMATION                   │
│  • Parse database fields                               │
│  • Apply business formatting                           │
│  • Validate data integrity                             │
│  • Convert to JSON format                              │
└─────────────────────┬───────────────────────────────────┘
                      │ Formatted Response Data
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 📤 RESPONSE FLOW                       │
│  Repository → Service → Controller → Middleware → Client│
└─────────────────────────────────────────────────────────┘
```

## 🚀 Practical Example: Creating a Recipe

Mari kita trace **step-by-step** bagaimana request `POST /api/recipes` mengalir:

### **1. 🌐 Client Request**
```http
POST /api/recipes HTTP/1.1
Content-Type: application/json
Host: localhost:3000

{
  "title": "Nasi Goreng Spesial",
  "description": "Nasi goreng dengan telur dan sayuran",
  "ingredients": ["nasi", "telur", "bawang", "kecap"],
  "instructions": ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"]
}
```

### **2. 🛡️ Middleware Processing**

#### **CORS Middleware**
```javascript
// src/middleware/cors.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  console.log('✅ CORS headers added');
  next(); // Pass to next middleware
});
```

#### **Logger Middleware**
```javascript
// src/middleware/logger.js
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Started`);
  
  // Log request body for POST/PUT
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next(); // Continue to next middleware
});
```

#### **JSON Parser Middleware**
```javascript
// Express built-in middleware
app.use(express.json());

// Transforms raw request body to JavaScript object:
// req.body = {
//   title: "Nasi Goreng Spesial",
//   description: "Nasi goreng dengan telur dan sayuran",
//   ingredients: ["nasi", "telur", "bawang", "kecap"],
//   instructions: ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"]
// }
```

### **3. 🎛️ Controller Processing**

```javascript
// src/controllers/recipeController.js
async createRecipe(req, res, next) {
  try {
    console.log('🎛️ Controller: Processing create recipe request');
    
    // 1. Extract data from request
    const { title, description, ingredients, instructions } = req.body;
    console.log('📥 Extracted data:', { title, ingredients: ingredients?.length });
    
    // 2. Basic validation
    if (!title || !ingredients || !instructions) {
      console.log('❌ Controller: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, ingredients, instructions'
      });
    }
    
    // 3. Prepare data for service layer
    const recipeData = {
      title: title.trim(),
      description: description?.trim() || null,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : []
    };
    console.log('📤 Sending to service:', recipeData.title);
    
    // 4. Call service layer
    const result = await this.recipeService.createRecipe(recipeData);
    console.log('✅ Controller: Service completed successfully');
    
    // 5. Format success response
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('❌ Controller: Error occurred:', error.message);
    next(error); // Pass to error middleware
  }
}
```

### **4. ⚙️ Service Layer Processing**

```javascript
// src/services/recipeService.js
async createRecipe(recipeData) {
  try {
    console.log('⚙️ Service: Starting recipe creation');
    console.log('📊 Input data validation...');
    
    // 1. Create Model instance for validation
    const recipeModel = new RecipeModel(recipeData);
    console.log('📋 Model created with data:', recipeModel.title);
    
    // 2. Validate data using Model
    const validationErrors = recipeModel.validate();
    if (validationErrors.length > 0) {
      console.log('❌ Service: Validation failed:', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    console.log('✅ Service: Data validation passed');
    
    // 3. Business rules validation
    if (recipeModel.ingredients.length > 20) {
      throw new Error('Maximum 20 ingredients allowed');
    }
    
    if (recipeModel.instructions.length < 2) {
      throw new Error('Recipe must have at least 2 instruction steps');
    }
    console.log('✅ Service: Business rules validated');
    
    // 4. Data transformation and sanitization
    const cleanedData = {
      title: recipeModel.title.trim(),
      description: recipeModel.description?.trim() || null,
      ingredients: recipeModel.ingredients.map(ing => ing.trim()).filter(Boolean),
      instructions: recipeModel.instructions.map(inst => inst.trim()).filter(Boolean)
    };
    console.log('🧹 Service: Data cleaned and sanitized');
    
    // 5. Call repository layer
    console.log('📤 Service: Sending to repository...');
    const createdRecipe = await this.recipeRepository.create(cleanedData);
    console.log('✅ Service: Repository operation completed');
    
    // 6. Return formatted response
    const response = {
      success: true,
      message: 'Recipe created successfully',
      data: createdRecipe.toJSON()
    };
    console.log('📤 Service: Returning formatted response');
    
    return response;
    
  } catch (error) {
    console.log('❌ Service: Error in createRecipe:', error.message);
    throw new Error(`Failed to create recipe: ${error.message}`);
  }
}
```

### **5. 🗃️ Repository Layer Processing**

```javascript
// src/repositories/recipeRepository.js
async create(recipeData) {
  try {
    console.log('🗃️ Repository: Starting database operation');
    
    // 1. Validate data with Model before DB operation
    const validationErrors = this.validateWithModel(recipeData);
    if (validationErrors.length > 0) {
      console.log('❌ Repository: Model validation failed');
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    console.log('✅ Repository: Pre-insert validation passed');
    
    // 2. Prepare database query
    const query = `
      INSERT INTO recipes (title, description, ingredients, instructions, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    // 3. Prepare data for database (JSON stringify arrays)
    const dbData = [
      recipeData.title,
      recipeData.description,
      JSON.stringify(recipeData.ingredients),
      JSON.stringify(recipeData.instructions)
    ];
    console.log('💾 Repository: Executing database insert...');
    
    // 4. Execute database operation
    const [result] = await this.db.query(query, dbData);
    const insertId = result.insertId;
    console.log('✅ Repository: Database insert completed, ID:', insertId);
    
    // 5. Fetch created record
    console.log('📖 Repository: Fetching created record...');
    const createdRecipe = await this.findById(insertId);
    
    if (!createdRecipe) {
      throw new Error('Failed to retrieve created recipe');
    }
    
    console.log('✅ Repository: Created recipe retrieved successfully');
    return createdRecipe; // Returns RecipeModel instance
    
  } catch (error) {
    console.log('❌ Repository: Database error:', error.message);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}

async findById(id) {
  try {
    const query = 'SELECT * FROM recipes WHERE id = ?';
    const [rows] = await this.db.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Transform database row to Model instance
    const recipeData = rows[0];
    
    // Parse JSON fields
    recipeData.ingredients = JSON.parse(recipeData.ingredients || '[]');
    recipeData.instructions = JSON.parse(recipeData.instructions || '[]');
    
    // Create and return Model instance
    return new RecipeModel(recipeData);
    
  } catch (error) {
    throw new Error(`Failed to find recipe by ID: ${error.message}`);
  }
}
```

### **6. 💾 Database Processing**

```sql
-- MySQL processes the INSERT statement
INSERT INTO recipes (
  title, 
  description, 
  ingredients, 
  instructions, 
  created_at, 
  updated_at
) VALUES (
  'Nasi Goreng Spesial',
  'Nasi goreng dengan telur dan sayuran',
  '["nasi","telur","bawang","kecap"]',
  '["Panaskan minyak","Tumis bawang","Masukkan nasi"]',
  '2025-07-01 10:30:00',
  '2025-07-01 10:30:00'
);

-- Returns: { insertId: 15, affectedRows: 1 }
-- Then SELECT to fetch the created record:

SELECT * FROM recipes WHERE id = 15;

-- Returns database row:
-- {
--   id: 15,
--   title: 'Nasi Goreng Spesial',
--   description: 'Nasi goreng dengan telur dan sayuran',
--   ingredients: '["nasi","telur","bawang","kecap"]',
--   instructions: '["Panaskan minyak","Tumis bawang","Masukkan nasi"]',
--   created_at: '2025-07-01T10:30:00.000Z',
--   updated_at: '2025-07-01T10:30:00.000Z'
-- }
```

### **7. 📋 Model Transformation**

```javascript
// src/models/recipeModel.js
class RecipeModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || null;
    
    // Parse ingredients if it's a JSON string from database
    this.ingredients = Array.isArray(data.ingredients) 
      ? data.ingredients 
      : JSON.parse(data.ingredients || '[]');
      
    // Parse instructions if it's a JSON string from database  
    this.instructions = Array.isArray(data.instructions)
      ? data.instructions
      : JSON.parse(data.instructions || '[]');
      
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    
    console.log('📋 Model: Instance created for recipe:', this.title);
  }
  
  toJSON() {
    console.log('🔄 Model: Converting to JSON format');
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
}
```

### **8. 📤 Response Flow Back to Client**

#### **Repository → Service**
```javascript
// Repository returns RecipeModel instance
const createdRecipe = new RecipeModel({
  id: 15,
  title: 'Nasi Goreng Spesial',
  // ... other fields
});

// Service receives and formats
return {
  success: true,
  message: 'Recipe created successfully',
  data: createdRecipe.toJSON()
};
```

#### **Service → Controller**
```javascript
// Controller receives service response
const result = await this.recipeService.createRecipe(recipeData);

// Controller formats HTTP response
res.status(201).json({
  success: true,
  message: 'Recipe created successfully',
  data: result.data, // Already in JSON format
  timestamp: new Date().toISOString()
});
```

#### **Controller → Client**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 15,
    "title": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan telur dan sayuran",
    "ingredients": ["nasi", "telur", "bawang", "kecap"],
    "instructions": ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"],
    "created_at": "2025-07-01T10:30:00.000Z",
    "updated_at": "2025-07-01T10:30:00.000Z"
  },
  "timestamp": "2025-07-01T10:30:15.123Z"
}
```

## ❌ Error Flow Example

Mari lihat bagaimana error mengalir melalui layers:

### **Scenario: Validation Error**

```javascript
// 1. Client sends invalid data
POST /api/recipes
{
  "title": "", // Empty title - validation error!
  "ingredients": [],
  "instructions": []
}

// 2. Controller passes to Service
// 3. Service creates Model and validates
const recipeModel = new RecipeModel(invalidData);
const errors = recipeModel.validate();
// errors = ["Title is required", "At least one ingredient is required"]

// 4. Service throws error
throw new Error(`Validation failed: ${errors.join(', ')}`);

// 5. Controller catches error
catch (error) {
  next(error); // Pass to error middleware
}

// 6. Error Middleware processes
if (error.message.includes('Validation')) {
  statusCode = 400;
  message = error.message;
}

// 7. Client receives error response
{
  "success": false,
  "message": "Validation failed: Title is required, At least one ingredient is required",
  "timestamp": "2025-07-01T10:30:15.123Z",
  "path": "/api/recipes"
}
```

## 🔍 Debugging Data Flow

### **Console Output untuk Successful Request**
```
[2025-07-01T10:30:00.000Z] POST /api/recipes - Started
Request Body: {
  "title": "Nasi Goreng Spesial",
  "ingredients": ["nasi", "telur", "bawang", "kecap"],
  "instructions": ["Panaskan minyak", "Tumis bawang", "Masukkan nasi"]
}
✅ CORS headers added
🎛️ Controller: Processing create recipe request
📥 Extracted data: { title: "Nasi Goreng Spesial", ingredients: 4 }
📤 Sending to service: Nasi Goreng Spesial
⚙️ Service: Starting recipe creation
📊 Input data validation...
📋 Model created with data: Nasi Goreng Spesial
✅ Service: Data validation passed
✅ Service: Business rules validated
🧹 Service: Data cleaned and sanitized
📤 Service: Sending to repository...
🗃️ Repository: Starting database operation
✅ Repository: Pre-insert validation passed
💾 Repository: Executing database insert...
✅ Repository: Database insert completed, ID: 15
📖 Repository: Fetching created record...
📋 Model: Instance created for recipe: Nasi Goreng Spesial
✅ Repository: Created recipe retrieved successfully
✅ Service: Repository operation completed
🔄 Model: Converting to JSON format
📤 Service: Returning formatted response
✅ Controller: Service completed successfully
[2025-07-01T10:30:00.100Z] POST /api/recipes - 201 - 100ms
```

### **Performance Monitoring Points**
```javascript
// Add timing to track performance
const startTime = Date.now();

// ... processing ...

const endTime = Date.now();
console.log(`⏱️ Operation completed in ${endTime - startTime}ms`);
```

## 🏋️‍♂️ Exercise

### **Exercise 1: Trace GET Request**
Trace bagaimana request `GET /api/recipes/1` mengalir:
1. Mulai dari middleware stack
2. Controller parameter extraction
3. Service validation
4. Repository database query
5. Model transformation
6. Response formatting

### **Exercise 2: Error Flow Analysis**
Create intentional errors dan trace flow:
1. Invalid JSON in request body
2. Database connection error
3. Recipe not found error
4. Business rule violation

### **Exercise 3: Performance Analysis**
Add timing logs di setiap layer dan analyze:
1. Which layer takes the most time?
2. Database vs business logic performance
3. Optimization opportunities

## 📚 Further Reading

- [🎛️ Controller Layer Guide](03-controller-layer.md)
- [⚙️ Service Layer Guide](04-service-layer.md)
- [🗃️ Repository Layer Guide](05-repository-layer.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Repository Layer →](05-repository-layer.md)**

---

*💡 **Tip**: Use console.log strategically di setiap layer untuk memahami data flow saat development!*
