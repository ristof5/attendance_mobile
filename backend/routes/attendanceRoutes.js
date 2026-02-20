// ================================================
// ATTENDANCE ROUTES
// File: routes/attendanceRoutes.js
// Handle routing untuk attendance (check-in, check-out, history)
// ================================================

const express = require('express');
const router = express.Router();

// Import controller (kita buat setelah ini)
const attendanceController = require('../controllers/attendanceController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// PENJELASAN ROUTING:
// Semua route attendance harus pakai authentication
// User harus login dulu (ada token) baru bisa akses

// ================================================
// PROTECTED ROUTES (semua perlu token)
// ================================================

// Apply auth middleware ke semua routes
router.use(authMiddleware);

// Check-in
// POST /api/attendance/check-in
// Body: { latitude, longitude, location_id, notes }
router.post('/check-in', attendanceController.checkIn);

// Check-out
// POST /api/attendance/check-out
// Body: { latitude, longitude, notes }
router.post('/check-out', attendanceController.checkOut);

// Get today's attendance
// GET /api/attendance/today
router.get('/today', attendanceController.getTodayAttendance);

// Get attendance history
// GET /api/attendance/history?limit=30&offset=0
router.get('/history', attendanceController.getHistory);

// Get monthly summary
// GET /api/attendance/summary?year=2024&month=2
router.get('/summary', attendanceController.getMonthlySummary);

module.exports = router;

// CARA PAKAI:
// Di server.js:
// const attendanceRoutes = require('./routes/attendanceRoutes');
// app.use('/api/attendance', attendanceRoutes);
//
// Endpoint yang tersedia:
// POST   http://localhost:3000/api/attendance/check-in
// POST   http://localhost:3000/api/attendance/check-out
// GET    http://localhost:3000/api/attendance/today
// GET    http://localhost:3000/api/attendance/history
// GET    http://localhost:3000/api/attendance/summary