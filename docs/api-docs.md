# 📖 API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Saat ini API belum menggunakan authentication. (Coming Soon)

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
  "error": "Detailed error information"
}
```

## Endpoints

### 🍜 Recipes

#### GET /recipes
Mendapatkan semua resep

**Response:**
```json
{
  "success": true,
  "message": "Recipes retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Nasi Goreng",
      "description": "Nasi goreng sederhana",
      "ingredients": "Nasi, telur, kecap",
      "instructions": "Tumis semua bahan, aduk rata, sajikan.",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /recipes/:id
Mendapatkan resep berdasarkan ID

**Parameters:**
- `id` (integer) - ID resep

**Response:**
```json
{
  "success": true,
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Nasi Goreng",
    "description": "Nasi goreng sederhana",
    "ingredients": "Nasi, telur, kecap",
    "instructions": "Tumis semua bahan, aduk rata, sajikan.",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /recipes
Menambahkan resep baru

**Request Body:**
```json
{
  "title": "Nama Resep", // required
  "description": "Deskripsi resep", // optional
  "ingredients": "Bahan-bahan", // required
  "instructions": "Cara membuat" // required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 4,
    "title": "Nama Resep",
    "description": "Deskripsi resep",
    "ingredients": "Bahan-bahan",
    "instructions": "Cara membuat"
  }
}
```

#### PUT /recipes/:id (Coming Soon)
Update resep berdasarkan ID

#### DELETE /recipes/:id (Coming Soon)
Hapus resep berdasarkan ID

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 400 | Bad Request - Request tidak valid |
| 404 | Not Found - Resource tidak ditemukan |
| 500 | Internal Server Error - Error pada server |

## Error Handling

API akan mengembalikan error dalam format JSON:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common errors:
- `Recipe not found` - Resep dengan ID tersebut tidak ditemukan
- `Title, ingredients, and instructions are required` - Field wajib tidak diisi
- `Error fetching recipes` - Error saat mengambil data dari database
