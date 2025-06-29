-- Setup database untuk Recipe API
-- Jalankan script ini di phpMyAdmin atau MySQL command line

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS recipe_db;
USE recipe_db;

-- Buat tabel recipes
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSON NOT NULL,
  instructions JSON NOT NULL,
  prep_time INT DEFAULT 0,
  cook_time INT DEFAULT 0,
  servings INT DEFAULT 1,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  category VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, category) VALUES
('Nasi Goreng Sederhana', 'Nasi goreng yang mudah dibuat dengan bahan-bahan sederhana', 
 '["2 porsi nasi", "2 butir telur", "3 siung bawang putih", "2 sdm kecap manis", "1 sdt garam", "Minyak untuk menumis"]',
 '["Panaskan minyak di wajan", "Tumis bawang putih hingga harum", "Masukkan telur, orak-arik", "Tambahkan nasi, aduk rata", "Bumbui dengan kecap manis dan garam", "Aduk hingga merata dan sajikan"]',
 10, 15, 2, 'easy', 'Indonesian'),

('Spaghetti Aglio Olio', 'Pasta Italia klasik dengan bawang putih dan olive oil',
 '["200g spaghetti", "4 siung bawang putih", "3 sdm olive oil", "1 sdt cabe bubuk", "Garam secukupnya", "Peterseli cincang"]',
 '["Rebus spaghetti hingga al dente", "Panaskan olive oil, tumis bawang putih", "Tambahkan cabe bubuk", "Masukkan spaghetti yang sudah direbus", "Aduk rata, tambahkan garam", "Taburi peterseli dan sajikan"]',
 5, 12, 2, 'easy', 'Italian'),

('Rendang Daging', 'Rendang daging sapi khas Minangkabau yang kaya rempah',
 '["1kg daging sapi", "400ml santan kental", "200ml santan encer", "10 cabai merah", "5 cabai keriting", "8 bawang merah", "6 bawang putih", "3cm jahe", "3cm lengkuas", "2 batang serai", "5 lembar daun jeruk", "2 lembar daun kunyit"]',
 '["Potong daging sesuai selera", "Haluskan semua bumbu", "Tumis bumbu halus hingga harum", "Masukkan daging, aduk hingga berubah warna", "Tuang santan encer, masak hingga daging empuk", "Tambahkan santan kental, masak hingga mengental", "Masak terus hingga bumbu meresap dan berminyak"]',
 30, 180, 8, 'hard', 'Indonesian');
