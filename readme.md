# 🍜 Recipe API 📖

Selamat datang di Recipe API! API ini menyediakan endpoint untuk mengelola resep masakan.

_Repo ini adalah hasil pembelajaran dengan rasa ingin tahu yang tinggi, dibantu oleh GitHub Copilot dan DimasVSuper._

## 🚀 Fitur

*   ✅ Mendapatkan daftar semua resep
*   🔎 Mendapatkan detail resep berdasarkan ID
*   ➕ Menambahkan resep baru

## 🛠️ Teknologi yang Digunakan

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?logo=node.js)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-4%2B-blue?logo=express)](https://expressjs.com/) [![MySQL](https://img.shields.io/badge/MySQL-Database-orange?logo=mysql)](https://www.mysql.com/) [![Postman](https://img.shields.io/badge/Postman-API%20Testing-red?logo=postman)](https://www.postman.com/)

## ⚙️ Cara Menjalankan Aplikasi

1.  Clone repositori ini:

    ```bash
    git clone <repository-url>
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Konfigurasi environment variables:

    *   Buat file `.env` berdasarkan contoh berikut:

        ```
        DB_HOST=(Sesuaikan dengan host MySQL Anda, default localhost)
        DB_USER=(Sesuaikan dengan username MySQL Anda)
        DB_PASSWORD=(Sesuaikan dengan password MySQL Anda)
        DB_NAME=recipe_db
        DB_PORT=(Sesuaikan dengan port MySQL Anda, default 3306)
        ```

    *   Sesuaikan nilai dengan konfigurasi database MySQL Anda.

4.  Jalankan server:

    ```bash
    node src/server.js
    ```

    Server akan berjalan di `http://localhost:3000`.

## 🧪 Menggunakan API dengan Postman

### 1. GET Semua Resep

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/recipes`
*   **Deskripsi:** Mendapatkan daftar semua resep yang tersedia.
*   **Contoh Response:**

    ```json
    [
      {
        "id": 1,
        "title": "Nasi Goreng",
        "description": "Nasi goreng sederhana",
        "ingredients": "Nasi, telur, kecap",
        "instructions": "Tumis semua bahan, aduk rata, sajikan."
      },
      {
        "id": 2,
        "title": "Mie Goreng",
        "description": "Mie goreng special",
        "ingredients": "Mie, telur, sayur",
        "instructions": "Masak semua bahan, aduk rata, sajikan.",
      }
    ]
    ```

### 2. GET Resep Berdasarkan ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/recipes/{id}`
    *   Ganti `{id}` dengan ID resep yang ingin Anda ambil. Contoh: `http://localhost:3000/api/recipes/1`
*   **Deskripsi:** Mendapatkan detail resep berdasarkan ID.
*   **Contoh Response:**

    ```json
    {
      "id": 1,
      "title": "Nasi Goreng",
      "description": "Nasi goreng sederhana",
      "ingredients": "Nasi, telur, kecap",
      "instructions": "Tumis semua bahan, aduk rata, sajikan."
    }
    ```

### 3. POST (Tambah) Resep Baru

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/recipes`
*   **Body (JSON):**

    ```json
    {
      "title": "Ayam Goreng",
      "description": "Ayam goreng kriuk",
      "ingredients": "Ayam, tepung, bumbu"
    }
    ```

*   **Deskripsi:** Menambahkan resep baru ke database.
*   **Contoh Response:**

    ```json
    {
      "id": 3,
      "title": "Ayam Goreng",
      "description": "Ayam goreng kriuk",
      "ingredients": "Ayam, tepung, bumbu",
      "instructions": "Lumuri ayam dengan tepung dan bumbu, goreng hingga matang."
    }
    ```

## 🤝 Kontribusi

Kontribusi sangat dipersilakan! Jika Anda menemukan bug atau memiliki ide fitur baru, silakan buat issue atau pull request.

## 📜 Lisensi

[ISC](https://opensource.org/licenses/ISC)