// ================================================
// AUTHENTICATION CONTROLLER
// File: controllers/authController.js
// Handle business logic untuk authentication
// ================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// PENJELASAN FLOW:
// 1. Controller menerima request dari route
// 2. Validasi input
// 3. Panggil model untuk operasi database
// 4. Process data (hash password, generate token, dll)
// 5. Return response ke client

// ================================================
// LOGIN
// POST /api/auth/login
// Body: { nip, password }
// ================================================
const login = async (req, res) => {
    try {
        const { nip, password } = req.body;
        
        // Validasi input
        if (!nip || !password) {
            return res.status(400).json({
                success: false,
                message: 'NIP and password are required'
            });
        }
        
        // Cari employee by NIP
        const employee = await Employee.findByNip(nip);
        
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid NIP or password'
            });
        }
        
        // Verify password
        // bcrypt.compare akan compare password plain text dengan hash di database
        const isPasswordValid = await bcrypt.compare(password, employee.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid NIP or password'
            });
        }
        
        // Generate JWT token
        // Token ini berisi info user (payload) dan di-sign dengan secret key
        const token = jwt.sign(
            {
                id: employee.id,
                nip: employee.nip,
                name: employee.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        // Hapus password dari response (security)
        delete employee.password;
        
        // Success response
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: employee.id,
                    nip: employee.nip,
                    name: employee.name,
                    email: employee.email,
                    position: employee.position
                }
            }
        });
        
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ================================================
// GET PROFILE
// GET /api/auth/profile
// Header: Authorization: Bearer {token}
// ================================================
const getProfile = async (req, res) => {
    try {
        // req.user sudah di-set oleh authMiddleware
        // Kita tinggal ambil data lengkap dari database
        const employee = await Employee.findById(req.user.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: employee
        });
        
    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ================================================
// LOGOUT
// POST /api/auth/logout
// Header: Authorization: Bearer {token}
// ================================================
const logout = async (req, res) => {
    try {
        // Karena pakai JWT (stateless), logout dilakukan di client side
        // dengan cara hapus token dari storage
        // Endpoint ini hanya untuk konfirmasi
        
        return res.status(200).json({
            success: true,
            message: 'Logout successful. Please remove token from client.'
        });
        
    } catch (error) {
        console.error('Error in logout:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Export semua functions
module.exports = {
    login,
    getProfile,
    logout
};

// CARA PAKAI:
// Di routes/authRoutes.js:
// const authController = require('./controllers/authController');
// router.post('/login', authController.login);
// router.get('/profile', authMiddleware, authController.getProfile);