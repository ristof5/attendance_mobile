// ================================================
// LOCATION ROUTES
// File: routes/locationRoutes.js
// Handle routing untuk office locations
// ================================================

const express = require('express');
const router = express.Router();

const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

// PENJELASAN:
// Routes untuk get data office locations
// User perlu tau lokasi kantor mana yang bisa dipilih
// Dan koordinat + radius untuk validasi

// All routes need authentication
router.use(authMiddleware);

// Get all active office locations
// GET /api/locations
router.get('/', locationController.getAll);

// Get specific location by ID
// GET /api/locations/:id
router.get('/:id', locationController.getById);

module.exports = router;

// CARA PAKAI:
// Di server.js:
// const locationRoutes = require('./routes/locationRoutes');
// app.use('/api/locations', locationRoutes);
//
// Endpoints:
// GET http://localhost:3000/api/locations
// GET http://localhost:3000/api/locations/1