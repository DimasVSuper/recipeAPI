# 📁 Struktur Folder Recipe API

Proyek ini menggunakan **Layered Architecture** untuk memisahkan concerns dengan baik dan memudahkan maintenance.

## 🏗️ Struktur Folder

```
recipeapi/
├── index.js                    # Entry point aplikasi
├── package.json               # Dependencies dan scripts
├── .env.example              # Template environment variables
├── .gitignore                # File yang diabaikan git
├── readme.md                 # Dokumentasi utama project
│
├── database/                 # Database scripts
│   └── setup.sql            # Script setup database dan sample data
│
├── docs/                     # Dokumentasi project
│   ├── api-docs.md          # Dokumentasi API endpoints
│   └── architecture.md     # Dokumentasi arsitektur
│
├── logs/                     # Log files (akan dibuat otomatis)
│   └── .gitkeep            # Placeholder untuk folder logs
│
├── src/                      # Source code utama
│   ├── app.js               # Konfigurasi Express app
│   │
│   ├── config/              # Konfigurasi aplikasi
│   │   ├── db.js           # Konfigurasi database
│   │   └── app.config.js   # Konfigurasi aplikasi umum
│   │
│   ├── constants/           # Konstanta dan enum
│   │   ├── http-status.js  # HTTP status codes
│   │   └── messages.js     # Pesan response
│   │
│   ├── controllers/         # HTTP Request/Response handlers
│   │   └── recipeController.js  # Handle HTTP requests untuk recipes
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── error.js        # Error handling middleware
│   │   └── logger.js       # Logging middleware
│   │
│   ├── models/              # Data models/schemas
│   │   └── recipeModel.js  # Schema dan validasi data recipe
│   │
│   ├── repositories/        # Data access layer
│   │   └── recipeRepository.js  # Operasi database untuk recipes
│   │
│   ├── routes/              # API routes definition
│   │   ├── index.js        # Route aggregator
│   │   └── recipeRoutes.js # Routes untuk recipes endpoints
│   │
│   ├── services/            # Business logic layer
│   │   └── recipeService.js # Logic bisnis untuk recipes
│   │
│   ├── utils/               # Helper functions
│   │   ├── response.js     # Response formatter
│   │   └── logger.js       # Logger utility
│   │
│   └── validators/          # Request validation
│       └── recipeValidator.js # Validasi input untuk recipes
│
└── tests/                    # Test files
    ├── unit/                # Unit tests
    ├── integration/         # Integration tests
    └── fixtures/            # Test data
```

## 🔄 Flow Data

```
Request → Routes → Controller → Validator → Service → Repository → Database
                     ↓
Response ← Utils ← Controller ← Service ← Repository ← Database
```

## 📋 Penjelasan Layer

### **Controllers**
- Handle HTTP requests dan responses
- Validasi input dari request
- Memanggil services untuk business logic
- Format response yang akan dikirim

### **Services**
- Berisi business logic aplikasi
- Orchestrate antara berbagai repositories
- Handle transaction dan complex operations
- Independent dari HTTP layer

### **Repositories**
- Data access layer
- Handle semua operasi database
- Abstraksi dari database operations
- Bisa diganti dengan implementasi lain (MongoDB, etc)

### **Validators**
- Validasi input request
- Schema validation
- Data type checking
- Custom validation rules

### **Middleware**
- Authentication & Authorization
- Logging requests
- Error handling
- CORS handling

### **Utils**
- Helper functions
- Common utilities
- Response formatters
- Logger configuration

### **Constants**
- HTTP status codes
- Error messages
- Configuration constants
- Enum values

## 🎯 Keuntungan Struktur Ini

✅ **Separation of Concerns** - Setiap layer punya tanggung jawab yang jelas
✅ **Testability** - Mudah untuk unit testing setiap layer
✅ **Maintainability** - Mudah maintenance dan debugging
✅ **Scalability** - Mudah ditambah fitur baru
✅ **Reusability** - Services dan utilities bisa digunakan ulang
✅ **Clean Code** - Code lebih terorganisir dan readable
