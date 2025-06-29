# Recipe API Documentation

> **Status**: ✅ **FULLY FUNCTIONAL & TESTED**
> 
> Last Updated: June 29, 2025

## Base Information

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Authentication**: None (public API)
- **Environment**: Development/Local

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes"
}
```

## ✅ Available Endpoints

### 1. GET /recipes - Retrieve All Recipes

**Status**: ✅ **WORKING**

```http
GET /api/recipes
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Recipes retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Nasi Goreng Sederhana",
      "description": "Nasi goreng yang mudah dibuat dengan bahan-bahan sederhana",
      "ingredients": "[\"2 porsi nasi\", \"2 butir telur\", \"3 siung bawang putih\", \"2 sdm kecap manis\", \"1 sdt garam\", \"Minyak untuk menumis\"]",
      "instructions": "[\"Panaskan minyak di wajan\", \"Tumis bawang putih hingga harum\", \"Masukkan telur, orak-arik\", \"Tambahkan nasi, aduk rata\", \"Bumbui dengan kecap manis dan garam\", \"Aduk hingga merata dan sajikan\"]",
      "created_at": "2025-06-29T12:04:23.000Z",
      "updated_at": "2025-06-29T12:04:23.000Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/recipes
```

### 2. GET /recipes/:id - Retrieve Recipe by ID

**Status**: ✅ **WORKING**

```http
GET /api/recipes/{id}
```

**Parameters**:
- `id` (path, required): Recipe ID (integer)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Nasi Goreng Sederhana",
    "description": "Nasi goreng yang mudah dibuat dengan bahan-bahan sederhana",
    "ingredients": "[\"2 porsi nasi\", \"2 butir telur\", \"3 siung bawang putih\"]",
    "instructions": "[\"Panaskan minyak di wajan\", \"Tumis bawang putih hingga harum\"]",
    "created_at": "2025-06-29T12:04:23.000Z",
    "updated_at": "2025-06-29T12:04:23.000Z"
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/recipes/1
```

### 3. POST /recipes - Create New Recipe

**Status**: ✅ **WORKING**

```http
POST /api/recipes
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Gado-Gado Jakarta",
  "description": "Gado-gado khas Jakarta dengan bumbu kacang",
  "ingredients": [
    "200g tahu",
    "200g tempe", 
    "100g kangkung",
    "100g tauge"
  ],
  "instructions": [
    "Rebus sayuran hingga matang",
    "Buat bumbu kacang",
    "Campurkan semua bahan",
    "Sajikan dengan kerupuk"
  ]
}
```

**Validation Rules**:
- `title` (required): String, minimum 3 characters
- `description` (optional): String
- `ingredients` (required): Array of strings, minimum 1 item
- `instructions` (required): Array of strings, minimum 1 item

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 4,
    "title": "Gado-Gado Jakarta",
    "description": "Gado-gado khas Jakarta dengan bumbu kacang",
    "ingredients": "[\"200g tahu\", \"200g tempe\", \"100g kangkung\", \"100g tauge\"]",
    "instructions": "[\"Rebus sayuran hingga matang\", \"Buat bumbu kacang\", \"Campurkan semua bahan\", \"Sajikan dengan kerupuk\"]",
    "prep_time": 0,
    "cook_time": 0,
    "servings": 1,
    "difficulty": "medium",
    "category": null,
    "image_url": null,
    "created_at": "2025-06-29T12:10:11.000Z",
    "updated_at": "2025-06-29T12:10:11.000Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gado-Gado Jakarta",
    "description": "Gado-gado khas Jakarta dengan bumbu kacang",
    "ingredients": ["200g tahu", "200g tempe", "100g kangkung", "100g tauge"],
    "instructions": ["Rebus sayuran hingga matang", "Buat bumbu kacang", "Campurkan semua bahan", "Sajikan dengan kerupuk"]
  }'
```

## 🔄 Coming Soon Endpoints

### 4. PUT /recipes/:id - Update Recipe
**Status**: 🔄 **IN DEVELOPMENT**

```http
PUT /api/recipes/{id}
Content-Type: application/json
```

Will support updating existing recipes with validation.

### 5. DELETE /recipes/:id - Delete Recipe  
**Status**: 🔄 **IN DEVELOPMENT**

```http
DELETE /api/recipes/{id}
```

Will support soft delete with confirmation.

## Error Handling

### Common Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Title is required",
  "error": "ValidationError: Title is required",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes"
}
```

#### 404 Not Found - Resource Not Found
```json
{
  "success": false,
  "message": "Recipe with ID 999 not found",
  "error": "Recipe with ID 999 not found",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes/999"
}
```

#### 500 Internal Server Error - Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Something went wrong",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes"
}
```

## Health Check

### GET /health - Server Health Check

**Status**: ✅ **WORKING**

```http
GET /health
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Recipe API is running!",
  "timestamp": "2025-06-29T12:00:00.000Z"
}
```

## Testing Examples

### Postman Collection
Import the following into Postman for easy testing:

```json
{
  "info": {
    "name": "Recipe API",
    "description": "Recipe API Testing Collection"
  },
  "item": [
    {
      "name": "Get All Recipes",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/recipes"
      }
    },
    {
      "name": "Get Recipe by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/recipes/1"
      }
    },
    {
      "name": "Create New Recipe",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/recipes",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "raw": "{\n  \"title\": \"Test Recipe\",\n  \"description\": \"Test Description\",\n  \"ingredients\": [\"ingredient1\", \"ingredient2\"],\n  \"instructions\": [\"step1\", \"step2\"]\n}"
        }
      }
    }
  ]
}
```

## Additional Notes

- All timestamps are in ISO 8601 format (UTC)
- JSON arrays are stored as JSON strings in database
- Database uses MySQL with JSON column types
- Comprehensive logging available in development mode
- CORS enabled for cross-origin requests

---

*Last updated: June 29, 2025*
*API Version: 1.0.0*
*Environment: Development*
