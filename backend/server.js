// backend/server.js
require('dotenv').config(); // Load variabel dari .env
const express = require('express');
const cors = require('cors');
const db = require('./config/database'); // Ini akan otomatis menjalankan test koneksi di database.js

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa menerima body request format JSON
app.use(express.urlencoded({ extended: true }));

// Route Testing
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Attendance App API" });
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});