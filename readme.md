# 🍜 Recipe API 📖

> **Project Status**: ✅ **FULLY FUNCTIONAL & PRODUCTION READY**

Selamat datang di Recipe API! API ini menyediakan endpoint untuk mengelola resep masakan menggunakan Node.js, Express.js, dan MySQL dengan Layered Architecture pattern.

## 📚 Tentang Project Pembelajaran Ini

> **"Learning by Building, Building by Learning"**

Repo ### 🏗️ **Architecture & Design**
- 📋 [**Folder Structure**](docs/folder-structure.md) - Struktur project dan penjelasan setiap direktori
- 🏗️ [**Layered Architecture**](docs/layered-architecture.md) - Deep dive pattern arsitektur dan best practices
- 🔗 [**Repository-Model Relationship**](docs/repository-model-relationship.md) - **BARU!** Dokumentasi lengkap hubungan Repository-Model
- 🔄 [**Application Flow**](docs/application-flow-updated.md) - Alur request-response detail dengan debugging tips

### 🛠️ **Implementation Details** 
- 📖 [**API Documentation**](docs/api-docs-updated.md) - Complete API reference dengan examples
- 🛡️ [**Error Handling**](docs/error-handling.md) - Centralized error handling system
- ⚙️ [**Middleware Guide**](docs/middleware.md) - CORS, logging, validation, error handling
- 🧪 [**Testing Documentation**](docs/testing.md) - **BARU!** Comprehensive testing guide dengan 80+ tests

### 🎓 **Learning Materials & Tutorials**
- 📚 [**Complete Learning Guide**](docs/learning/README.md) - **BARU!** Comprehensive learning path dengan 13 chapters
- 📖 [**Quick Start Guide**](docs/learning/00-introduction.md) - **BARU!** Start your learning journey here
- 🏗️ [**Architecture Overview**](docs/learning/01-architecture-overview.md) - **BARU!** Understanding layered architecture
- 🧪 [**Testing Fundamentals**](docs/learning/08-testing-fundamentals.md) - **BARU!** Complete testing strategy
- 🎛️ [**Controller Layer Guide**](docs/learning/03-controller-layer.md) - **BARU!** HTTP handling mastery
- ⚙️ [**Service Layer Guide**](docs/learning/04-service-layer.md) - **BARU!** Business logic deep dive

**hasil eksplorasi pembelajaran** oleh **Dimas Bayu Nugroho** dalam memahami:
- 🏗️ **Layered Architecture** - Pemisahan concerns yang proper ✅
- ⚙️ **Heavy Backend Logic** - Business logic yang terstruktur dan scalable ✅
- 🔄 **Clean Code Principles** - Kode yang mudah dibaca dan di-maintain ✅
- 🛡️ **Error Handling** - Centralized error handling dan logging ✅
- 🔧 **Middleware Stack** - CORS, validation, logging, error handling ✅

Dikembangkan dengan bantuan **GitHub Copilot** dan **Claude Sonnet 3.5** sebagai learning companion untuk mengeksplor best practices dalam pengembangan backend API.

### 🎯 **Learning Goals:**
- ✅ Memahami perbedaan **MVC** vs **Layered Architecture**
- ✅ Implementasi **Repository Pattern** untuk data access
- ✅ Praktik **Service Layer** untuk business logic
- ✅ Struktur project yang **scalable** dan **maintainable**
- ✅ Error handling yang **consistent** di setiap layer
- ✅ **Repository-Model Integration** - Model validation & data transformation
- ✅ **Clean Data Flow** - Proper separation of concerns antar layer

---

_"Setiap baris kode adalah pembelajaran, setiap bug adalah guru, setiap refactor adalah evolusi."_ 🚀

## 🚀 Fitur

*   ✅ **Mendapatkan daftar semua resep** - GET endpoint dengan response formatting
*   ✅ **Mendapatkan detail resep berdasarkan ID** - GET dengan parameter validation
*   ✅ **Menambahkan resep baru** - POST dengan comprehensive validation dan JSON array support
*   ✅ **Mengupdate resep** - PUT endpoint dengan Model validation dan data transformation
*   ✅ **Menghapus resep** - DELETE endpoint dengan proper error handling
*   ✅ **Repository-Model Integration** - Fully integrated Model-Repository relationship
*   ✅ **Error handling terpusat** - Consistent error responses
*   ✅ **Request logging** - Comprehensive request/response logging
*   ✅ **CORS support** - Cross-origin resource sharing
*   ✅ **Environment configuration** - .env support untuk database credentials

## 🛠️ Teknologi yang Digunakan

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/) 
[![Express](https://img.shields.io/badge/Express-4.18%2B-blue?logo=express)](https://expressjs.com/) 
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-orange?logo=mysql)](https://www.mysql.com/) 
[![XAMPP](https://img.shields.io/badge/XAMPP-Development-purple)](https://www.apachefriends.org/)
[![Postman](https://img.shields.io/badge/Postman-API%20Testing-red?logo=postman)](https://www.postman.com/)
[![Nodemon](https://img.shields.io/badge/Nodemon-Development-76d04b)](https://nodemon.io/)

## 🏗️ Arsitektur

Proyek ini menggunakan **Layered Architecture** untuk memisahkan concerns dengan baik:

- **Controllers** - Handle HTTP requests/responses, route handling
- **Services** - Business logic layer, data validation, business rules
- **Repositories** - Data access layer, database operations
- **Middleware** - Cross-cutting concerns (logging, validation, error handling, CORS)
- **Config** - Database connection dan environment configuration
- **Utils** - Helper functions dan utilities

📋 [**Dokumentasi Lengkap Struktur Folder**](docs/folder-structure.md)

## 📁 Struktur Project

```
recipeapi/
├── index.js                    # Entry point aplikasi ✅
├── package.json               # Dependencies dan scripts ✅
├── .env.example              # Template environment variables ✅
├── .env                      # Environment variables (not in git) ✅
├── .gitignore               # Git ignore file ✅
├── database/                 # Database scripts ✅
│   └── setup.sql            # Script setup database ✅
├── docs/                     # Dokumentasi project ✅
│   ├── api-docs.md          # API documentation ✅
│   ├── application-flow.md  # Request flow documentation ✅
│   ├── error-handling.md    # Error handling guide ✅
│   ├── folder-structure.md  # Project structure ✅
│   ├── layered-architecture.md # Architecture guide ✅
│   └── middleware.md        # Middleware documentation ✅
├── logs/                     # Log files ✅
│   └── .gitkeep            # Keep directory in git ✅
├── src/                      # Source code utama ✅
│   ├── app.js               # Konfigurasi Express app ✅
│   ├── config/              # Konfigurasi aplikasi ✅
│   │   └── db.js           # Database connection ✅
│   ├── controllers/         # Request handling layer ✅
│   │   └── recipeController.js # Recipe endpoints ✅
│   ├── services/            # Business logic layer ✅
│   │   └── recipeService.js # Recipe business logic ✅
│   ├── repositories/        # Data access layer ✅
│   │   └── recipeRepository.js # Database operations ✅
│   ├── middleware/          # Cross-cutting concerns ✅
│   │   ├── cors.js         # CORS handling ✅
│   │   ├── errorHandler.js # Error handling ✅
│   │   ├── logger.js       # Request logging ✅
│   │   └── validation.js   # Input validation ✅
│   ├── models/              # Data models ✅
│   │   └── recipeModel.js  # Recipe data structure ✅
│   ├── routes/              # Route definitions ✅
│   │   └── recipeRoutes.js # Recipe routes ✅
│   └── utils/               # Helper functions ✅
└── tests/                    # Test files (future) 🔄
```
│   ├── constants/           # Konstanta dan enum
│   ├── controllers/         # HTTP Request/Response handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Data models/schemas
│   ├── repositories/        # Data access layer
│   ├── routes/              # API routes definition
│   ├── services/            # Business logic layer
│   ├── utils/               # Helper functions
│   └── validators/          # Request validation
└── tests/                    # Test files
```

## ⚙️ Cara Menjalankan Aplikasi

### 📋 Prerequisites
- **Node.js** (v18+) dan **npm** ✅
- **XAMPP** dengan MySQL running ✅
- **Git** untuk version control ✅

### 🚀 Setup & Instalasi

1.  **Clone repositori ini**:
    ```bash
    git clone https://github.com/DimasVSuper/recipeAPI.git
    cd recipeAPI
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup environment variables**:
    ```bash
    # Copy template .env
    cp .env.example .env
    
    # Edit .env file sesuai konfigurasi database Anda
    # DB_HOST=localhost
    # DB_USER=root
    # DB_PASSWORD=
    # DB_NAME=recipe_db
    # DB_PORT=3306
    # PORT=3000
    ```

4.  **Setup database**:
    - Pastikan **XAMPP MySQL sudah running**
    - Buka **phpMyAdmin** di `http://localhost/phpmyadmin`
    - Copy-paste isi `database/setup.sql` dan jalankan
    - Atau via command line:
    ```bash
    mysql -u root -p < database/setup.sql
    ```

### 🎮 Menjalankan Aplikasi

#### Development Mode (Recommended)
```bash
npm run dev
```
- ✅ Auto-restart saat file berubah (nodemon)
- ✅ Detailed logging dan error messages
- ✅ Request/response logging untuk debugging

#### Production Mode
```bash
npm start
```
- ✅ Optimized untuk production
- ✅ Minimal logging
- ✅ Error messages disembunyikan

### **🧪 Manual Testing Guide**

#### **Using curl Commands**
```bash
# Health check
curl http://localhost:3000/health

# Get all recipes  
curl http://localhost:3000/api/recipes

# Get specific recipe
curl http://localhost:3000/api/recipes/1

# Create recipe (JSON)
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Recipe","ingredients":["a","b"],"instructions":["1","2"]}'

# Create recipe (Form Data)
curl -X POST http://localhost:3000/api/recipes \
  -d "title=Simple Recipe" \
  -d 'ingredients=["ingredient1", "ingredient2"]' \
  -d 'instructions=["step1", "step2"]'
```

#### **Using Postman (Manual)**
1. **Download Postman** dari [postman.com](https://www.postman.com)
2. **Create new request**:
   - Method: POST
   - URL: `http://localhost:3000/api/recipes`
3. **Testing Options**:
   - **JSON**: Body → raw → JSON
   - **Form Data**: Body → x-www-form-urlencoded
4. **Form data example**:
   ```
   title = "Nasi Gudeg"
   description = "Makanan khas Jogja"  
   ingredients = ["nasi", "gudeg", "ayam"]
   instructions = ["siapkan nasi", "tambah gudeg", "sajikan"]
   ```

#### **Using Browser (GET endpoints)**
- Health: `http://localhost:3000/health`
- All recipes: `http://localhost:3000/api/recipes`
- Single recipe: `http://localhost:3000/api/recipes/1`

## 📝 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. **GET /recipes** - Ambil semua resep ✅
```bash
curl -X GET http://localhost:3000/api/recipes
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
      "ingredients": "[\"2 porsi nasi\", \"2 butir telur\", \"3 siung bawang putih\"]",
      "instructions": "[\"Panaskan minyak di wajan\", \"Tumis bawang putih hingga harum\"]",
      "created_at": "2025-06-29T12:04:23.000Z",
      "updated_at": "2025-06-29T12:04:23.000Z"
    }
  ]
}
```

#### 2. **GET /recipes/:id** - Ambil resep berdasarkan ID ✅
```bash
curl -X GET http://localhost:3000/api/recipes/1
```

#### 3. **POST /recipes** - Tambah resep baru ✅

**Supports Multiple Content Types:**
- ✅ **JSON** (`application/json`)
- ✅ **Form Data** (`application/x-www-form-urlencoded`)

**JSON Example:**
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gado-Gado Jakarta",
    "description": "Gado-gado khas Jakarta dengan bumbu kacang",
    "ingredients": ["200g tahu", "200g tempe", "100g kangkung"],
    "instructions": ["Rebus sayuran", "Buat bumbu kacang", "Campurkan semua"]
  }'
```

**Form Data Example:**
```bash
curl -X POST http://localhost:3000/api/recipes \
  -d "title=Gudeg Jogja" \
  -d "description=Gudeg khas Jogja dengan santan" \
  -d 'ingredients=["500g nangka muda", "200ml santan", "bumbu"]' \
  -d 'instructions=["Rebus nangka", "Tumis bumbu", "Masak hingga matang"]'
```

**Postman Testing:**
1. **JSON**: Body → raw → JSON
2. **Form Data**: Body → x-www-form-urlencoded
   - `title`: "Recipe Name"
   - `description`: "Recipe description"  
   - `ingredients`: `["ingredient1", "ingredient2"]` (JSON string)
   - `instructions`: `["step1", "step2"]` (JSON string)

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 4,
    "title": "Gado-Gado Jakarta",
    "description": "Gado-gado khas Jakarta dengan bumbu kacang",
    "ingredients": "[\"200g tahu\", \"200g tempe\", \"100g kangkung\"]",
    "instructions": "[\"Rebus sayuran\", \"Buat bumbu kacang\", \"Campurkan semua\"]",
    "created_at": "2025-06-29T12:10:11.000Z",
    "updated_at": "2025-06-29T12:10:11.000Z"
  }
}
```

#### 4. **PUT /recipes/:id** - Update resep (Coming Soon) 🔄
#### 5. **DELETE /recipes/:id** - Hapus resep (Coming Soon) 🔄

### Error Responses

**400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "message": "Title is required",
  "error": "ValidationError: Title is required",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes"
}
```

**404 Not Found** - Resource tidak ditemukan:
```json
{
  "success": false,
  "message": "Recipe with ID 999 not found",
  "error": "Recipe with ID 999 not found",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes/999"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Something went wrong",
  "timestamp": "2025-06-29T12:00:00.000Z",
  "path": "/api/recipes"
}
```

📖 [**Dokumentasi API Lengkap**](docs/api-docs-updated.md)

## 📚 Dokumentasi Lengkap

Proyek ini dilengkapi dengan dokumentasi komprehensif untuk pembelajaran:

### 🏗️ **Architecture & Design**
- 📋 [**Folder Structure**](docs/folder-structure.md) - Struktur project dan penjelasan setiap direktori
- 🏗️ [**Layered Architecture**](docs/layered-architecture.md) - Deep dive pattern arsitektur dan best practices
- � [**Repository-Model Relationship**](docs/repository-model-relationship.md) - **BARU!** Dokumentasi lengkap hubungan Repository-Model
- �🔄 [**Application Flow**](docs/application-flow-updated.md) - Alur request-response detail dengan debugging tips

### 🛠️ **Implementation Details** 
- 📖 [**API Documentation**](docs/api-docs-updated.md) - Complete API reference dengan examples
- 🛡️ [**Error Handling**](docs/error-handling.md) - Centralized error handling system
- ⚙️ [**Middleware Guide**](docs/middleware.md) - CORS, logging, validation, error handling

### 🎓 **Learning Resources**
- 🚀 [**Quick Start Guide**](#️-cara-menjalankan-aplikasi) - Setup dan menjalankan aplikasi
- 🧪 [**Testing Examples**](#-test-api-endpoints) - cURL commands dan Postman collections
- 🔧 [**Troubleshooting**](docs/application-flow-updated.md#-debugging-tips) - Common issues dan solutions

## 🎓 Learning Insights

### **Masalah yang Dipecahkan Selama Development**

#### 1. **Middleware Order Issue** ✅ Fixed
**Problem**: Request body `undefined` saat logging
**Root Cause**: Logger middleware dijalankan sebelum `express.json()`
**Solution**: Reorder middleware - body parsing harus sebelum logging

#### 2. **Data Type Mismatch** ✅ Fixed  
**Problem**: `TypeError: ingredients.trim is not a function`
**Root Cause**: Validation expect string, tapi client kirim array
**Solution**: Update validation untuk handle array data type

#### 3. **Database JSON Storage** ✅ Fixed
**Problem**: `Column count doesn't match value count`  
**Root Cause**: Array langsung ke MySQL tanpa stringify
**Solution**: `JSON.stringify()` arrays sebelum database insert

### **Key Takeaways untuk Backend Development**
- ⚙️ **Middleware order is critical** - Body parsing harus sebelum middleware yang access body
- 🔄 **Data type consistency** - Pastikan consistent di semua layer (validation → service → repository)
- 🛡️ **Error handling strategy** - Centralized error handling dengan proper HTTP status codes
- 📋 **Logging for debugging** - Comprehensive logging untuk trace request flow
- 🏗️ **Layered architecture benefits** - Clean separation of concerns untuk maintainability

## 🚀 Next Steps & Enhancements

### **Immediate (Current Sprint)**
- ✅ GET /recipes endpoint - **DONE**
- ✅ GET /recipes/:id endpoint - **DONE**  
- ✅ POST /recipes endpoint - **DONE**
- ✅ Comprehensive error handling - **DONE**
- ✅ Request/response logging - **DONE**

### **Phase 2 (Coming Soon)**
- 🔄 PUT /recipes/:id - Update existing recipes
- 🗑️ DELETE /recipes/:id - Delete recipes (soft delete)
- 🔍 Search & filtering - GET /recipes?search=keyword
- 📄 Pagination - GET /recipes?page=1&limit=10

### **Phase 3 (Advanced Features)**
- 🔐 Authentication & Authorization (JWT)
- 📷 Image upload untuk recipes
- 🏷️ Categories & tags system
- ⭐ Rating & review system
- 📊 Analytics & metrics

### **Phase 4 (Production Ready)**
- 🧪 Unit & integration tests
- 🐳 Docker containerization
- 🚀 CI/CD pipeline
- 📈 Performance monitoring
- 🔒 Security hardening
    
    **Atau menggunakan npm:**
    ```bash
    npm start
    ```

    **Development mode (dengan auto-restart):**
    ```bash
    npm run dev
    ```

    Server akan berjalan di `http://localhost:3000`.

## 🔧 Scripts yang Tersedia

```bash
npm start          # Menjalankan aplikasi dalam production mode
npm run dev        # Menjalankan aplikasi dalam development mode dengan nodemon
npm test           # Menjalankan test (belum diimplementasi)
```

## 🗂️ API Endpoints

| Method | Endpoint | Deskripsi |
## 📊 Status Summary

| Endpoint | Status | Method | Description |
|----------|--------|--------|-------------|
| `/api/recipes` | ✅ **WORKING** | GET | Mendapatkan semua resep |
| `/api/recipes/:id` | ✅ **WORKING** | GET | Mendapatkan resep berdasarkan ID |
| `/api/recipes` | ✅ **WORKING** | POST | Menambahkan resep baru |
| `/health` | ✅ **WORKING** | GET | Server health check |
| `/api/recipes/:id` | 🔄 **PLANNED** | PUT | Update resep |
| `/api/recipes/:id` | 🔄 **PLANNED** | DELETE | Hapus resep |

### **System Status**
- ✅ **Database**: MySQL connected dengan 4 sample recipes
- ✅ **Server**: Running on http://localhost:3000
- ✅ **Middleware Stack**: CORS, logging, validation, error handling aktif
- ✅ **Environment**: .env configuration setup
- ✅ **Documentation**: Complete technical documentation

---

## 💡 Inspirasi & Motivasi

> *"Recipe API ini bukan hanya tentang CRUD operations, tapi tentang memahami philosophy backend development yang proper. Setiap bug yang kita fix, setiap refactor yang kita lakukan, adalah pembelajaran berharga dalam journey menjadi backend developer yang profesional."*

### **What I Learned Building This**
- 🧠 **Problem-solving mindset** - Debug systematic dari middleware order sampai data type consistency
- 🏗️ **Architecture thinking** - Bagaimana memisahkan concerns dengan proper layered architecture  
- 🔧 **Modern tooling** - Node.js ecosystem, MySQL integration, environment management
- 📖 **Documentation culture** - Comprehensive docs sebagai bagian dari professional development
- 🤖 **AI-assisted learning** - Bagaimana leverage AI tools untuk accelerate learning curve

### **For Fellow Learning Developers**
Jika kamu sedang belajar backend development, repo ini adalah **real example** bagaimana:
- ✅ Structure project dengan scalable architecture
- ✅ Handle errors dengan professional approach  
- ✅ Implement middleware stack yang comprehensive
- ✅ Debug issues dengan systematic approach
- ✅ Document code untuk maintainability

**Keep coding, keep learning, keep building! 🚀**

---

## 🤝 Contributing & Feedback

Repo ini dibuat untuk pembelajaran. Jika kamu punya saran, improvement, atau pertanyaan:

- 📧 **Email**: dimasbayu@example.com
- 💬 **Discussion**: Open an issue untuk diskusi
- 🐛 **Bug Reports**: Create issue dengan detail steps to reproduce
- 💡 **Feature Requests**: Share your ideas untuk enhancement

---

## � License

Project ini dibuat untuk keperluan pembelajaran dan bersifat **open source**. Silakan gunakan, modifikasi, dan share untuk keperluan edukatif.

---

*Built with ❤️ by **Dimas Bayu Nugroho** • Powered by Node.js, Express.js & MySQL • Enhanced with AI Assistance*

**Last Updated**: June 29, 2025  
**Version**: 1.0.0  
**Status**: Production Ready for Learning 🎓

- [Struktur Folder](docs/folder-structure.md) - Penjelasan lengkap struktur project
- [Application Flow](docs/application-flow.md) - **Bagaimana aplikasi bekerja dari awal sampai akhir**
- [API Documentation](docs/api-docs.md) - Dokumentasi endpoint API
- [Architecture Guide](docs/architecture.md) - Panduan arsitektur aplikasi *(Coming Soon)*

## 🚀 Deployment

### Menggunakan PM2 (Recommended untuk Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start aplikasi dengan PM2
pm2 start index.js --name "recipe-api"

# Monitoring
pm2 monit

# Restart aplikasi
pm2 restart recipe-api
```

### Untuk Development/Learning
```bash
# Development mode dengan auto-restart
npm run dev

# Production mode
npm start
```

## 🔒 Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recipe_db
DB_PORT=3306

# Application Configuration
PORT=3000
```

## 🤝 Kontribusi

Kontribusi sangat dipersilakan! Jika Anda menemukan bug atau memiliki ide fitur baru, silakan buat issue atau pull request.

## 📜 Lisensi

[ISC](https://opensource.org/licenses/ISC)