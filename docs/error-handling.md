# Error Handling Documentation

## Overview
Error handling adalah aspek krusial dalam pengembangan API yang robust. Middleware error handler ini menyediakan penanganan error terpusat untuk seluruh aplikasi Recipe API.

## Error Handler Middleware

### Location
```
src/middleware/errorHandler.js
```

### Purpose
- Menangani semua error yang terjadi di aplikasi secara terpusat
- Memberikan response error yang konsisten
- Menyembunyikan detail error sensitif di production
- Logging error untuk debugging

## Error Response Format

### Success Response (untuk perbandingan)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error (only in development)",
  "timestamp": "2025-06-29T10:30:00.000Z",
  "path": "/api/recipes/123"
}
```

## Error Types & Status Codes

### 1. Validation Errors (400 Bad Request)
Terjadi ketika data input tidak valid.

**Triggers:**
- Error message contains "required"
- Error message contains "Validation"
- Error message contains "Invalid"

**Example:**
```json
{
  "success": false,
  "message": "Title is required",
  "error": "ValidationError: Title is required",
  "timestamp": "2025-06-29T10:30:00.000Z",
  "path": "/api/recipes"
}
```

### 2. Not Found Errors (404 Not Found)
Terjadi ketika resource tidak ditemukan.

**Triggers:**
- Error message contains "not found"

**Example:**
```json
{
  "success": false,
  "message": "Recipe with ID 999 not found",
  "error": "Recipe with ID 999 not found",
  "timestamp": "2025-06-29T10:30:00.000Z",
  "path": "/api/recipes/999"
}
```

### 3. Server Errors (500 Internal Server Error)
Error default untuk semua error yang tidak terkategorikan.

**Example:**
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Something went wrong",
  "timestamp": "2025-06-29T10:30:00.000Z",
  "path": "/api/recipes"
}
```

## Implementation Details

### Error Detection Logic
```javascript
// Validation errors
if (err.message.includes('required') || 
    err.message.includes('Validation') || 
    err.message.includes('Invalid')) {
  statusCode = 400;
}

// Not found errors
if (err.message.includes('not found')) {
  statusCode = 404;
}

// Default to 500 for unhandled errors
```

### Environment-Based Error Details
- **Development**: Menampilkan detail error lengkap
- **Production**: Hanya menampilkan pesan generic "Something went wrong"

```javascript
error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
```

## Usage in Application Flow

### 1. Controller Level
```javascript
const recipeController = {
  async getRecipeById(req, res, next) {
    try {
      // Business logic
    } catch (error) {
      next(error); // Pass error to error handler
    }
  }
};
```

### 2. Service Level
```javascript
const recipeService = {
  async findById(id) {
    const recipe = await recipeRepository.findById(id);
    if (!recipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }
};
```

### 3. Middleware Integration
```javascript
// In app.js
app.use('/api/recipes', recipeRoutes);
app.use(errorHandler); // Error handler harus di akhir
```

## Best Practices

### 1. Consistent Error Messages
```javascript
// Good - Descriptive and consistent
throw new Error('Recipe with ID ${id} not found');
throw new Error('Title is required');

// Bad - Vague or inconsistent
throw new Error('Error');
throw new Error('Something wrong');
```

### 2. Error Logging
```javascript
console.error('Error occurred:', err);
```
- Semua error di-log untuk debugging
- Include timestamp dan path untuk tracing

### 3. Security Considerations
- Detail error hanya ditampilkan di development
- Tidak expose stack trace di production
- Tidak expose database error details

## Common Error Scenarios

### 1. Database Connection Error
```javascript
// Service layer
try {
  const result = await db.query(sql, params);
} catch (error) {
  throw new Error('Database connection failed');
}
```

### 2. Validation Error
```javascript
// Validation middleware
if (!title || title.trim().length === 0) {
  throw new Error('Title is required');
}
```

### 3. Resource Not Found
```javascript
// Repository layer
const recipe = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
if (recipe.length === 0) {
  throw new Error(`Recipe with ID ${id} not found`);
}
```

## Testing Error Handler

### Manual Testing
```bash
# Test not found error
curl -X GET http://localhost:3000/api/recipes/999

# Test validation error
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{}'

# Test invalid data
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

### Expected Responses
1. **404 Error** - Recipe not found
2. **400 Error** - Validation failed
3. **400 Error** - Invalid data

## Future Enhancements

### 1. Custom Error Classes
```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
```

### 2. Error Monitoring
- Integration dengan service monitoring (Sentry, LogRocket)
- Error tracking dan alerting
- Performance metrics

### 3. Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ]
});
```

## Related Documentation
- [API Documentation](./api-docs.md)
- [Middleware Documentation](./middleware.md)
- [Application Flow](./application-flow.md)
- [Layered Architecture](./layered-architecture.md)

## Tips untuk Mahasiswa

### 1. Error Handling Strategy
- **Fail Fast**: Validate input early
- **Centralized**: Handle errors in one place
- **Informative**: Provide clear error messages
- **Secure**: Don't expose sensitive information

### 2. Debugging Tips
- Check logs directory untuk error details
- Use development mode untuk detail error lengkap
- Test berbagai skenario error
- Pastikan semua error path ter-handle

### 3. Learning Path
1. Pahami JavaScript Error dan try-catch
2. Pelajari Express.js error handling middleware
3. Explore HTTP status codes
4. Practice dengan custom error classes
5. Learn about error monitoring tools

---

*Dokumentasi ini dibuat sebagai bagian dari Recipe API learning project. Update sesuai kebutuhan dan perkembangan aplikasi.*
