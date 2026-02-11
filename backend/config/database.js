// ================================================
// DATABASE CONNECTION - MySQL
// File: config/database.js
// ================================================

const mysql = require('mysql2');

// PENJELASAN:
// mysql2 adalah library untuk connect ke MySQL
// kita pakai createPool bukan createConnection karena:
// - Pool lebih efisien (reuse connections)
// - Handle multiple requests simultaneously
// - Auto reconnect jika connection lost

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',     // Alamat MySQL server
    user: process.env.DB_USER || 'root',          // Username MySQL
    password: process.env.DB_PASSWORD || '',      // Password MySQL (kosong di XAMPP default)
    database: process.env.DB_NAME || 'employee_attendance',  // Nama database
    port: process.env.DB_PORT || 3306,            // Port MySQL (default 3306)
    waitForConnections: true,                      // Tunggu jika semua connection sibuk
    connectionLimit: 10,                           // Max 10 connections bersamaan
    queueLimit: 0                                  // Unlimited queue
});

// TEST CONNECTION
// Ini akan langsung test connection saat file ini di-require
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection FAILED!');
        console.error('Error:', err.message);
        
        // Kasih hint berdasarkan error code
        if (err.code === 'ECONNREFUSED') {
            console.error('💡 Solusi: Pastikan MySQL di XAMPP sudah running!');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Solusi: Cek username/password di .env');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Solusi: Database belum dibuat. Buat database di phpMyAdmin');
        }
        return;
    }
    
    console.log('✅ Database connected successfully!');
    console.log(`   Database: ${process.env.DB_NAME || 'employee_attendance'}`);
    connection.release(); // Kembalikan connection ke pool
});

// Export promise-based pool
// Kenapa promise? Karena lebih modern dan mudah pakai async/await
const promisePool = pool.promise();

module.exports = {
    pool,           // Export pool biasa (callback style)
    promisePool,    // Export pool dengan Promise (async/await style)
    
    // Helper function untuk query SELECT
    query: async (sql, params) => {
        const [rows] = await promisePool.query(sql, params);
        return rows;
    },
    
    // Helper function untuk INSERT, UPDATE, DELETE
    execute: async (sql, params) => {
        const [result] = await promisePool.execute(sql, params);
        return result;
    }
};