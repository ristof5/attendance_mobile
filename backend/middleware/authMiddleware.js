// ================================================
// AUTHENTICATION MIDDLEWARE
// File: middleware/authMiddleware.js
// Verify JWT token dan attach user data ke request
// ================================================

const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// PENJELASAN:
// Middleware ini akan:
// 1. Extract token dari header Authorization
// 2. Verify token dengan JWT_SECRET
// 3. Get user data dari database
// 4. Attach user data ke req.user
// 5. Lanjut ke next() jika valid, atau return error jika tidak

const authMiddleware = async (req, res, next) => {
    try {
        // Get token dari header
        // Format: "Authorization: Bearer {token}"
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
        }
        
        // Extract token (ambil setelah "Bearer ")
        const token = authHeader.split(' ')[1];
        
        // Verify token
        // Jika token invalid atau expired, akan throw error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Token valid, sekarang ambil data user dari database
        const employee = await Employee.findById(decoded.id);
        
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        // Attach user data ke request
        // Sekarang controller bisa akses req.user
        req.user = {
            id: employee.id,
            nip: employee.nip,
            name: employee.name,
            email: employee.email,
            position: employee.position
        };
        
        // Lanjut ke controller
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        // Handle different JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = authMiddleware;

// CARA PAKAI:
// Di routes, tambahkan sebagai middleware:
//
// const authMiddleware = require('./middleware/authMiddleware');
//
// // Route tanpa protection
// router.post('/login', authController.login);
//
// // Route dengan protection (perlu token)
// router.get('/profile', authMiddleware, authController.getProfile);
//
// Setelah pakai middleware ini, controller bisa akses:
// req.user.id
// req.user.nip
// req.user.name
// dll