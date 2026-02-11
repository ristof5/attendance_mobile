// ================================================
// EMPLOYEE MODEL
// File: models/Employee.js
// Handle database operations untuk table employees
// ================================================

const db = require('../config/database');

// PENJELASAN KONSEP MODEL:
// Model adalah layer yang handle semua komunikasi dengan database
// Semua query SQL untuk table employees ada di sini
// Controller nanti akan pakai model ini, bukan query langsung

class Employee {
    
    // ================================================
    // FIND BY NIP (untuk login)
    // ================================================
    static async findByNip(nip) {
        try {
            const sql = `
                SELECT id, nip, name, email, password, phone, position, status, created_at
                FROM employees 
                WHERE nip = ? AND status = 'active'
                LIMIT 1
            `;
            
            const result = await db.query(sql, [nip]);
            
            // Jika ada hasil, return object pertama
            // Jika tidak ada, return null
            return result.length > 0 ? result[0] : null;
            
        } catch (error) {
            console.error('Error in findByNip:', error);
            throw error;
        }
    }
    
    // ================================================
    // FIND BY ID
    // ================================================
    static async findById(id) {
        try {
            const sql = `
                SELECT id, nip, name, email, phone, position, status, created_at
                FROM employees 
                WHERE id = ?
                LIMIT 1
            `;
            
            const result = await db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
            
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }
    
    // ================================================
    // GET ALL EMPLOYEES (dengan pagination)
    // ================================================
    static async getAll(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT id, nip, name, email, phone, position, status, created_at
                FROM employees 
                ORDER BY name ASC
                LIMIT ? OFFSET ?
            `;
            
            const result = await db.query(sql, [parseInt(limit), parseInt(offset)]);
            return result;
            
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    }
    
    // ================================================
    // COUNT TOTAL EMPLOYEES
    // ================================================
    static async count() {
        try {
            const sql = 'SELECT COUNT(*) as total FROM employees';
            const result = await db.query(sql);
            return result[0].total;
            
        } catch (error) {
            console.error('Error in count:', error);
            throw error;
        }
    }
    
    // ================================================
    // CREATE NEW EMPLOYEE (untuk nanti jika perlu register)
    // ================================================
    static async create(employeeData) {
        try {
            const sql = `
                INSERT INTO employees (nip, name, email, password, phone, position)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                employeeData.nip,
                employeeData.name,
                employeeData.email,
                employeeData.password,  // Password harus sudah di-hash sebelum sampai sini
                employeeData.phone || null,
                employeeData.position || 'Staff'
            ];
            
            const result = await db.execute(sql, params);
            
            // Return ID yang baru dibuat
            return {
                id: result.insertId,
                nip: employeeData.nip,
                name: employeeData.name
            };
            
        } catch (error) {
            console.error('Error in create:', error);
            
            // Handle duplicate entry error
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('NIP or Email already exists');
            }
            
            throw error;
        }
    }
}

// Export class
module.exports = Employee;

// CARA PAKAI:
// const Employee = require('./models/Employee');
// const employee = await Employee.findByNip('EMP001');
// const allEmployees = await Employee.getAll();