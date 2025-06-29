# 🛡️ Middleware Documentation

Middleware adalah **functions yang dieksekusi di antara request dan response**. Dalam Layered Architecture, middleware berperan penting untuk:

## 🎯 **Fungsi Middleware:**

1. **Authentication & Authorization** *(Coming Soon)*
2. **Logging** - Log semua request/response
3. **Validation** - Validasi input sebelum masuk controller
4. **Error Handling** - Handle error secara konsisten
5. **CORS** - Handle cross-origin requests

## 📋 **Middleware yang Sudah Dibuat:**

### **1. Logger Middleware (`middleware/logger.js`)**
```javascript
// Log semua request yang masuk
app.use(logger);
```

**Fungsi:**
- ✅ Log HTTP method, URL, timestamp
- ✅ Log request body untuk POST/PUT
- ✅ Log response time
- ✅ Log response data (development mode)

**Output Example:**
```
[2024-01-01T10:00:00.000Z] GET /api/recipes - Mozilla/5.0...
[2024-01-01T10:00:00.000Z] GET /api/recipes - 200 - 45ms
```

### **2. CORS Middleware (`middleware/cors.js`)**
```javascript
// Handle cross-origin requests
app.use(cors);
```

**Fungsi:**
- ✅ Allow all origins (untuk learning)
- ✅ Allow specific methods (GET, POST, PUT, DELETE)
- ✅ Handle preflight OPTIONS requests

### **3. Validation Middleware (`middleware/validation.js`)**
```javascript
// Validasi sebelum masuk controller
router.post('/', validateRecipe, recipeController.createRecipe);
router.get('/:id', validateId, recipeController.getRecipeById);
```

**Fungsi:**
- ✅ Validasi required fields
- ✅ Validasi panjang minimum
- ✅ Validasi format ID parameter
- ✅ Return error response jika validation gagal

### **4. Error Handler Middleware (`middleware/errorHandler.js`)**
```javascript
// Must be the last middleware!
app.use(errorHandler);
```

**Fungsi:**
- ✅ Catch semua error dari controller/service
- ✅ Format error response secara konsisten
- ✅ Log error untuk debugging
- ✅ Hide sensitive error details di production

## 🔄 **Flow dengan Middleware:**

```
Request → CORS → Logger → JSON Parser → Validation → Controller → Service → Repository
                                                              ↓
Error ← Error Handler ← Controller ← Service ← Repository ← Database
```

## 📝 **Urutan Middleware (PENTING!):**

```javascript
// 1. CORS - harus pertama untuk preflight
app.use(cors);

// 2. Logger - log semua request
app.use(logger);

// 3. Body parser - parse JSON
app.use(express.json());

// 4. Routes dengan validation middleware
app.use('/api/recipes', recipeRoutes);

// 5. 404 handler
app.use('*', notFoundHandler);

// 6. Error handler - HARUS TERAKHIR!
app.use(errorHandler);
```

## 🎯 **Keuntungan Middleware Pattern:**

### **1. Separation of Concerns**
- **Controller** fokus ke business logic
- **Middleware** handle cross-cutting concerns

### **2. Reusability**
- Validation middleware bisa dipakai di routes lain
- Logger middleware untuk semua request

### **3. Maintainability**
- Error handling terpusat
- Easy to add/remove features

### **4. Clean Code**
- Controller jadi lebih simple
- Validation logic terpisah

## 📊 **Before vs After Middleware:**

### **Before (Without Middleware):**
```javascript
// Controller handle semua validation & error
async createRecipe(req, res) {
  try {
    // 1. Validasi input
    if (!req.body.title) {
      return res.status(400).json({...});
    }
    
    // 2. Business logic
    const result = await recipeService.createRecipe(req.body);
    
    // 3. Response
    res.status(201).json(result);
  } catch (error) {
    // 4. Error handling
    res.status(500).json({...});
  }
}
```

### **After (With Middleware):**
```javascript
// Controller HANYA business logic
async createRecipe(req, res, next) {
  try {
    // Validation sudah dilakukan di middleware
    const result = await recipeService.createRecipe(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error); // Error handling dilakukan di middleware
  }
}
```

## 🚀 **Testing Middleware:**

### **1. Test Logger:**
```bash
# Lihat console log saat hit endpoint
curl http://localhost:3000/api/recipes
```

### **2. Test Validation:**
```bash
# Test validation error
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'  # Title kosong
```

### **3. Test Error Handler:**
```bash
# Test invalid ID
curl http://localhost:3000/api/recipes/abc
```

### **4. Test CORS:**
```javascript
// Test dari browser dengan fetch
fetch('http://localhost:3000/api/recipes')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 💡 **Tips untuk Learning:**

1. **Lihat urutan eksekusi** di console log
2. **Experiment dengan middleware order** - coba pindah urutan
3. **Buat custom middleware** untuk learning
4. **Debug dengan console.log** di setiap middleware

**Middleware adalah jantung dari Express.js application!** 🔥
