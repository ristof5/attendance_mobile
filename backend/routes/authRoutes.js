// ================================================
// AUTHENTICATION ROUTES
// File: routes/authRoutes.js
// Handle routing untuk authentication (login, profile, logout)
// ================================================

const express = require('express');
const router = express.Router();

// Import controller (kita buat setelah ini)
const authController = require('../controllers/authController');

// Import middleware (kita buat setelah ini)
const authMiddleware = require('../middleware/authMiddleware');

// PENJELASAN ROUTING:
// - POST /api/auth/login      → Login dengan NIP & password (public)
// - GET  /api/auth/profile    → Get user profile (protected, perlu token)
// - POST /api/auth/logout     → Logout (protected, perlu token)

// ================================================
// PUBLIC ROUTES (tidak perlu token)
// ================================================

// Login
router.post('/login', authController.login);

// ================================================
// PROTECTED ROUTES (perlu token di header)
// ================================================

// Get Profile - pakai middleware authMiddleware untuk cek token
router.get('/profile', authMiddleware, authController.getProfile);

// Logout (optional - karena JWT stateless, logout di handle client side)
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

// CARA PAKAI:
// Di server.js, import dan gunakan:
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);
//
// Endpoint yang tersedia:
// POST   http://localhost:3000/api/auth/login
// GET    http://localhost:3000/api/auth/profile (dengan token)
// POST   http://localhost:3000/api/auth/logout (dengan token)