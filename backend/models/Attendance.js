// ================================================
// ATTENDANCE MODEL - Part 1 (Read Operations)
// File: models/Attendance.js
// Handle database operations untuk table attendances
// ================================================

const db = require("../config/database");

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
      const today = new Date().toISOString().split("T")[0];

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
      console.error("Error in getTodayByEmployeeId:", error);
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
        parseInt(offset),
      ]);

      return result;
    } catch (error) {
      console.error("Error in getHistoryByEmployeeId:", error);
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
      console.error("Error in countByEmployeeId:", error);
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
      console.error("Error in findById:", error);
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
      console.error("Error in getMonthlySummary:", error);
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
      console.error("Error in hasCheckedInToday:", error);
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
      console.error("Error in hasCheckedOutToday:", error);
      throw error;
    }
  }
  // ================================================
  // ATTENDANCE MODEL - Part 2 (Write Operations)
  // Tambahkan ke file models/Attendance.js
  // ================================================

  // INSTRUKSI:
  // Copy semua function di bawah ini dan tambahkan ke dalam class Attendance
  // yang sudah ada di file models/Attendance.js (Part 1)

  // Paste di dalam class Attendance, setelah function yang sudah ada

  // ================================================
  // CREATE CHECK-IN
  // ================================================
  static async checkIn(checkInData) {
    try {
      const sql = `
                INSERT INTO attendances (
                    employee_id, 
                    location_id, 
                    check_in_time, 
                    check_in_latitude, 
                    check_in_longitude, 
                    check_in_distance,
                    status,
                    notes
                )
                VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
            `;

      const params = [
        checkInData.employee_id,
        checkInData.location_id,
        checkInData.latitude,
        checkInData.longitude,
        checkInData.distance,
        checkInData.status || "present", // present/late
        checkInData.notes || null,
      ];

      const result = await db.execute(sql, params);

      // Return record yang baru dibuat
      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error in checkIn:", error);
      throw error;
    }
  }

  // ================================================
  // CREATE CHECK-OUT
  // Update existing attendance record
  // ================================================
  static async checkOut(attendanceId, checkOutData) {
    try {
      const sql = `
                UPDATE attendances 
                SET 
                    check_out_time = NOW(),
                    check_out_latitude = ?,
                    check_out_longitude = ?,
                    check_out_distance = ?,
                    notes = CONCAT(COALESCE(notes, ''), ?)
                WHERE id = ?
            `;

      // Prepare notes
      const additionalNotes = checkOutData.notes
        ? ` | Check-out: ${checkOutData.notes}`
        : "";

      const params = [
        checkOutData.latitude,
        checkOutData.longitude,
        checkOutData.distance,
        additionalNotes,
        attendanceId,
      ];

      await db.execute(sql, params);

      // Return updated record
      return await this.findById(attendanceId);
    } catch (error) {
      console.error("Error in checkOut:", error);
      throw error;
    }
  }

  // ================================================
  // CALCULATE DISTANCE (Haversine Formula)
  // Helper function untuk hitung jarak antara 2 koordinat GPS
  // ================================================
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance dalam meter
  }

  // ================================================
  // DETERMINE STATUS (present or late)
  // Based on check-in time vs work start time
  // ================================================
  static determineStatus(checkInTime) {
    // Get waktu check-in dalam format HH:MM:SS
    const checkInHour = new Date(checkInTime).toTimeString().split(" ")[0];

    // Ambil work start time dari env atau default 08:00:00
    const workStartTime = process.env.WORK_START_TIME || "08:00:00";

    // Compare
    if (checkInHour > workStartTime) {
      return "late";
    }

    return "present";
  }

  // ================================================
  // CARA PAKAI CHECK-IN:
  // ================================================
  /*
const Attendance = require('./models/Attendance');
const OfficeLocation = require('./models/OfficeLocation');

// 1. Get office location
const office = await OfficeLocation.findById(1);

// 2. Calculate distance dari user ke office
const distance = Attendance.calculateDistance(
    userLatitude, userLongitude,
    office.latitude, office.longitude
);

// 3. Validasi apakah dalam radius
if (distance > office.radius) {
    return res.status(400).json({
        success: false,
        message: `You are ${Math.round(distance)}m away. Must be within ${office.radius}m`
    });
}

// 4. Determine status
const status = Attendance.determineStatus(new Date());

// 5. Create check-in
const attendance = await Attendance.checkIn({
    employee_id: 1,
    location_id: office.id,
    latitude: userLatitude,
    longitude: userLongitude,
    distance: distance,
    status: status,
    notes: 'Check-in dari mobile app'
});

console.log(attendance);
*/

  // ================================================
  // CARA PAKAI CHECK-OUT:
  // ================================================
  /*
// 1. Get today's attendance
const todayAttendance = await Attendance.getTodayByEmployeeId(employeeId);

if (!todayAttendance) {
    return res.status(400).json({
        success: false,
        message: 'No check-in found for today'
    });
}

if (todayAttendance.check_out_time) {
    return res.status(400).json({
        success: false,
        message: 'Already checked out'
    });
}

// 2. Calculate distance (optional untuk check-out)
const distance = Attendance.calculateDistance(
    userLatitude, userLongitude,
    todayAttendance.office_latitude,
    todayAttendance.office_longitude
);

// 3. Create check-out
const updated = await Attendance.checkOut(todayAttendance.id, {
    latitude: userLatitude,
    longitude: userLongitude,
    distance: distance,
    notes: 'Check-out dari mobile app'
});

console.log(updated);
*/
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
