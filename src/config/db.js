const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // ganti jika user MySQL Anda berbeda
  password: '',         // ganti jika ada password MySQL
  database: 'recipe_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();