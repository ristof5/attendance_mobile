// ================================================
// OFFICE LOCATION MODEL
// File: models/OfficeLocation.js
// Handle database operations untuk table office_locations
// ================================================

const db = require('../config/database');

// PENJELASAN:
// Model ini handle data lokasi kantor
// Setiap lokasi punya koordinat GPS (latitude, longitude)
// Dan radius dalam meter untuk validasi absensi

class OfficeLocation {
    
    // ================================================
    // GET ALL ACTIVE LOCATIONS
    // ================================================
    static async getAll() {
        try {
            const sql = `
                SELECT id, name, address, latitude, longitude, radius, status, created_at
                FROM office_locations 
                WHERE status = 'active'
                ORDER BY name ASC
            `;
            
            const result = await db.query(sql);
            return result;
            
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    }
    
    // ================================================
    // FIND BY ID
    // ================================================
    static async findById(id) {
        try {
            const sql = `
                SELECT id, name, address, latitude, longitude, radius, status, created_at
                FROM office_locations 
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
    // GET DEFAULT LOCATION (ID = 1 atau yang pertama)
    // ================================================
    static async getDefault() {
        try {
            const sql = `
                SELECT id, name, address, latitude, longitude, radius, status, created_at
                FROM office_locations 
                WHERE status = 'active'
                ORDER BY id ASC
                LIMIT 1
            `;
            
            const result = await db.query(sql);
            return result.length > 0 ? result[0] : null;
            
        } catch (error) {
            console.error('Error in getDefault:', error);
            throw error;
        }
    }
    
    // ================================================
    // CREATE NEW LOCATION (untuk admin nanti)
    // ================================================
    static async create(locationData) {
        try {
            const sql = `
                INSERT INTO office_locations (name, address, latitude, longitude, radius)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const params = [
                locationData.name,
                locationData.address || null,
                locationData.latitude,
                locationData.longitude,
                locationData.radius || 100  // Default 100 meter
            ];
            
            const result = await db.execute(sql, params);
            
            return {
                id: result.insertId,
                name: locationData.name
            };
            
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }
    
    // ================================================
    // CHECK IF COORDINATES WITHIN RADIUS
    // Helper function untuk validasi
    // ================================================
    static isWithinRadius(userLat, userLng, officeLat, officeLng, radius) {
        // Haversine formula untuk hitung jarak antara 2 koordinat
        const R = 6371e3; // Earth radius dalam meter
        const φ1 = userLat * Math.PI / 180;
        const φ2 = officeLat * Math.PI / 180;
        const Δφ = (officeLat - userLat) * Math.PI / 180;
        const Δλ = (officeLng - userLng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Jarak dalam meter
        
        return {
            isWithin: distance <= radius,
            distance: Math.round(distance)
        };
    }
}

module.exports = OfficeLocation;

// CARA PAKAI:
// const OfficeLocation = require('./models/OfficeLocation');
// 
// const location = await OfficeLocation.findById(1);
// const check = OfficeLocation.isWithinRadius(
//     -6.2088, 106.8456,  // User coordinates
//     location.latitude, location.longitude,  // Office coordinates
//     location.radius
// );
// console.log(check.isWithin);  // true/false
// console.log(check.distance);  // jarak dalam meter