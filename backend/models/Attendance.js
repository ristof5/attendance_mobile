// ================================================
// ATTENDANCE MODEL - Part 1 (Read Operations)
// File: models/Attendance.js
// Handle database operations untuk table attendances
// ================================================

const db = require('../config/database');

// PENJELASAN:
// Model ini handle data absensi karyawan
// Part 1 ini fokus ke READ operations dulu (get data)
// Part 2 nanti kita buat untuk CREATE (check-in/check-out)

class Attendance {
    
    // ================================================
    // GET TODAY'S ATTENDANCE by Employee ID
    // Cek apakah karyawan sudah absen hari ini
    // ================================================
    static async getTodayByEmployeeId(employeeId) {
        try {
            // Get today's date (format: YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];
            
            const sql = `
                SELECT 
                    a.*,
                    l.name as office_name,
                    l.address as office_address,
                    l.latitude as office_latitude,
                    l.longitude as office_longitude,
                    l.radius as office_radius
                FROM attendances a
                LEFT JOIN office_locations l ON a.location_id = l.id
                WHERE a.employee_id = ?
                AND DATE(a.check_in_time) = ?
                LIMIT 1
            `;
            
            const result = await db.query(sql, [employeeId, today]);
            return result.length > 0 ? result[0] : null;
            
        } catch (error) {
            console.error('Error in getTodayByEmployeeId:', error);
            throw error;
        }
    }
    
    // ================================================
    // GET ATTENDANCE HISTORY by Employee ID
    // Dengan pagination
    // ================================================
    static async getHistoryByEmployeeId(employeeId, limit = 30, offset = 0) {
        try {
            const sql = `
                SELECT 
                    a.*,
                    l.name as office_name,
                    l.address as office_address,
                    TIMESTAMPDIFF(MINUTE, a.check_in_time, a.check_out_time) as work_duration_minutes
                FROM attendances a
                LEFT JOIN office_locations l ON a.location_id = l.id
                WHERE a.employee_id = ?
                ORDER BY a.check_in_time DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await db.query(sql, [
                employeeId, 
                parseInt(limit), 
                parseInt(offset)
            ]);
            
            return result;
            
        } catch (error) {
            console.error('Error in getHistoryByEmployeeId:', error);
            throw error;
        }
    }
    
    // ================================================
    // COUNT TOTAL ATTENDANCE by Employee ID
    // ================================================
    static async countByEmployeeId(employeeId) {
        try {
            const sql = `
                SELECT COUNT(*) as total 
                FROM attendances 
                WHERE employee_id = ?
            `;
            
            const result = await db.query(sql, [employeeId]);
            return result[0].total;
            
        } catch (error) {
            console.error('Error in countByEmployeeId:', error);
            throw error;
        }
    }
    
    // ================================================
    // GET ATTENDANCE BY ID
    // ================================================
    static async findById(id) {
        try {
            const sql = `
                SELECT 
                    a.*,
                    e.nip,
                    e.name as employee_name,
                    l.name as office_name,
                    TIMESTAMPDIFF(MINUTE, a.check_in_time, a.check_out_time) as work_duration_minutes
                FROM attendances a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN office_locations l ON a.location_id = l.id
                WHERE a.id = ?
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
    // GET MONTHLY SUMMARY by Employee ID
    // Statistik absensi per bulan
    // ================================================
    static async getMonthlySummary(employeeId, year, month) {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                    SUM(CASE WHEN status = 'permission' THEN 1 ELSE 0 END) as permission_count
                FROM attendances
                WHERE employee_id = ?
                AND YEAR(check_in_time) = ?
                AND MONTH(check_in_time) = ?
            `;
            
            const result = await db.query(sql, [employeeId, year, month]);
            return result[0];
            
        } catch (error) {
            console.error('Error in getMonthlySummary:', error);
            throw error;
        }
    }
    
    // ================================================
    // CHECK IF ALREADY CHECKED IN TODAY
    // Return true/false
    // ================================================
    static async hasCheckedInToday(employeeId) {
        try {
            const attendance = await this.getTodayByEmployeeId(employeeId);
            return attendance !== null;
            
        } catch (error) {
            console.error('Error in hasCheckedInToday:', error);
            throw error;
        }
    }
    
    // ================================================
    // CHECK IF ALREADY CHECKED OUT TODAY
    // Return true/false
    // ================================================
    static async hasCheckedOutToday(employeeId) {
        try {
            const attendance = await this.getTodayByEmployeeId(employeeId);
            
            if (!attendance) return false;
            
            // Check apakah check_out_time sudah terisi
            return attendance.check_out_time !== null;
            
        } catch (error) {
            console.error('Error in hasCheckedOutToday:', error);
            throw error;
        }
    }
}

module.exports = Attendance;

// CARA PAKAI:
// const Attendance = require('./models/Attendance');
//
// // Check absensi hari ini
// const today = await Attendance.getTodayByEmployeeId(1);
// console.log(today);
//
// // Get history
// const history = await Attendance.getHistoryByEmployeeId(1, 10, 0);
// console.log(history);
//
// // Check sudah absen belum
// const hasCheckedIn = await Attendance.hasCheckedInToday(1);
// console.log(hasCheckedIn); // true/false