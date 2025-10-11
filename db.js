const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',  
  password: 'manhquyet1362006',  
  database: 'quanlicuahang'
});

const db = pool.promise();

module.exports = db;