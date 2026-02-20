// ================================================
// SERVER.JS - Final Version dengan Semua Routes
// File: server.js
// ================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// ================================================
// MIDDLEWARE
// ================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });
}

// ================================================
// ROUTES
// ================================================

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Employee Attendance API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: "/api/auth",
            attendance: "/api/attendance",
            locations: "/api/locations"
        }
    });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ================================================
// START SERVER
// ================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\n================================================');
    console.log('🚀 Employee Attendance API Server');
    console.log('================================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database: Connected`);
    console.log('================================================');
    console.log('📡 Available Endpoints:');
    console.log('\n   🔐 Authentication:');
    console.log(`      POST http://localhost:${PORT}/api/auth/login`);
    console.log(`      GET  http://localhost:${PORT}/api/auth/profile`);
    console.log('\n   📍 Attendance:');
    console.log(`      POST http://localhost:${PORT}/api/attendance/check-in`);
    console.log(`      POST http://localhost:${PORT}/api/attendance/check-out`);
    console.log(`      GET  http://localhost:${PORT}/api/attendance/today`);
    console.log(`      GET  http://localhost:${PORT}/api/attendance/history`);
    console.log(`      GET  http://localhost:${PORT}/api/attendance/summary`);
    console.log('\n   🏢 Locations:');
    console.log(`      GET  http://localhost:${PORT}/api/locations`);
    console.log(`      GET  http://localhost:${PORT}/api/locations/:id`);
    console.log('================================================\n');
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

module.exports = app;