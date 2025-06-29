# 🍜 Recipe API 📖

Selamat datang di Recipe API! API ini menyediakan endpoint untuk mengelola resep masakan.

## 📚 Tentang Project Pembelajaran Ini

> **"Learning by Building, Building by Learning"**

Repo ini adalah **hasil eksplorasi pembelajaran** oleh **Dimas Bayu Nugroho** dalam memahami:
- 🏗️ **Layered Architecture** - Pemisahan concerns yang proper
- ⚙️ **Heavy Backend Logic** - Business logic yang terstruktur dan scalable  
- 🔄 **Clean Code Principles** - Kode yang mudah dibaca dan di-maintain

Dikembangkan dengan bantuan **GitHub Copilot** dan **Claude Sonnet 3.5** sebagai learning companion untuk mengeksplor best practices dalam pengembangan backend API.

### 🎯 **Learning Goals:**
- ✅ Memahami perbedaan **MVC** vs **Layered Architecture**
- ✅ Implementasi **Repository Pattern** untuk data access
- ✅ Praktik **Service Layer** untuk business logic
- ✅ Struktur project yang **scalable** dan **maintainable**
- ✅ Error handling yang **consistent** di setiap layer

---

_"Setiap baris kode adalah pembelajaran, setiap bug adalah guru, setiap refactor adalah evolusi."_ 🚀

## 🚀 Fitur

*   ✅ Mendapatkan daftar semua resep
*   🔎 Mendapatkan detail resep berdasarkan ID
*   ➕ Menambahkan resep baru
*   📝 Mengupdate resep (Coming Soon)
*   🗑️ Menghapus resep (Coming Soon)

## 🛠️ Teknologi yang Digunakan

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?logo=node.js)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-4%2B-blue?logo=express)](https://expressjs.com/) [![MySQL](https://img.shields.io/badge/MySQL-Database-orange?logo=mysql)](https://www.mysql.com/) [![Postman](https://img.shields.io/badge/Postman-API%20Testing-red?logo=postman)](https://www.postman.com/)

## 🏗️ Arsitektur

Proyek ini menggunakan **Layered Architecture** untuk memisahkan concerns dengan baik:

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic layer
- **Repositories** - Data access layer
- **Validators** - Request validation
- **Middleware** - Authentication, logging, error handling
- **Utils** - Helper functions dan utilities

📋 [**Dokumentasi Lengkap Struktur Folder**](docs/folder-structure.md)

## 📁 Struktur Project

```
recipeapi/
├── index.js                    # Entry point aplikasi
├── package.json               # Dependencies dan scripts
├── .env.example              # Template environment variables
├── database/                 # Database scripts
│   └── setup.sql            # Script setup database
├── docs/                     # Dokumentasi project
├── logs/                     # Log files
├── src/                      # Source code utama
│   ├── app.js               # Konfigurasi Express app
│   ├── config/              # Konfigurasi aplikasi
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

1.  Clone repositori ini:

    ```bash
    git clone https://github.com/DimasVSuper/recipeAPI.git
    cd recipeAPI
    ```

2.  Masuk ke direktori project dan install dependencies:

    ```bash
    npm install
    ```

3.  Setup database:

    *   Pastikan MySQL sudah terinstall dan berjalan
    *   Buat database dengan menjalankan script SQL:

        ```bash
        mysql -u root -p < database/setup.sql
        ```

    *   Atau jalankan manual di MySQL:

        ```sql
        CREATE DATABASE recipe_db;
        USE recipe_db;
        -- Lalu jalankan isi dari file database/setup.sql
        ```

4.  Konfigurasi environment variables:

    *   Salin file `.env.example` menjadi `.env`:

        ```bash
        cp .env.example .env
        ```

    *   Edit file `.env` dan sesuaikan dengan konfigurasi MySQL Anda:

        ```
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_password
        DB_NAME=recipe_db
        DB_PORT=3306
        ```

5.  Jalankan server:

    **Production mode:**
    ```bash
    node index.js
    ```
    
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
|--------|----------|-----------|
| GET | `/api/recipes` | Mendapatkan semua resep |
| GET | `/api/recipes/:id` | Mendapatkan resep berdasarkan ID |
| POST | `/api/recipes` | Menambahkan resep baru |
| PUT | `/api/recipes/:id` | Update resep (Coming Soon) |
| DELETE | `/api/recipes/:id` | Hapus resep (Coming Soon) |

## 🧪 Testing dengan Postman

Import collection: [Recipe API Collection](docs/postman-collection.json) *(Coming Soon)*

## 📚 Dokumentasi

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