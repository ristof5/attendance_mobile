// ================================================
// ATTENDANCE CONTROLLER - Part 1 (Check-in)
// File: controllers/attendanceController.js
// Handle business logic untuk attendance
// ================================================

const Attendance = require("../models/Attendance");
const OfficeLocation = require("../models/OfficeLocation");

// PENJELASAN FLOW CHECK-IN:
// 1. Validasi input (latitude, longitude)
// 2. Cek apakah sudah check-in hari ini
// 3. Get office location
// 4. Calculate distance dari user ke office
// 5. Validasi apakah dalam radius
// 6. Determine status (present/late)
// 7. Create attendance record
// 8. Return response

// ================================================
// CHECK-IN
// POST /api/attendance/check-in
// Body: { latitude, longitude, location_id, notes }
// ================================================
const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, location_id, notes } = req.body;
    const employeeId = req.user.id; // Dari auth middleware

    // ================================================
    // STEP 1: Validasi Input
    // ================================================
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Validasi format koordinat
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates format",
      });
    }

    // Validasi range koordinat
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Coordinates out of valid range",
      });
    }

    // ================================================
    // STEP 2: Cek Sudah Check-in Hari Ini?
    // ================================================
    const hasCheckedIn = await Attendance.hasCheckedInToday(employeeId);

    if (hasCheckedIn) {
      const todayAttendance = await Attendance.getTodayByEmployeeId(employeeId);
      return res.status(400).json({
        success: false,
        message: "You have already checked in today",
        data: {
          check_in_time: todayAttendance.check_in_time,
          status: todayAttendance.status,
          office_name: todayAttendance.office_name,
        },
      });
    }

    // ================================================
    // STEP 3: Get Office Location
    // ================================================
    let officeLocation;

    if (location_id) {
      // Kalau ada location_id, pakai itu
      officeLocation = await OfficeLocation.findById(location_id);
    } else {
      // Kalau tidak, pakai default location
      officeLocation = await OfficeLocation.getDefault();
    }

    if (!officeLocation) {
      return res.status(404).json({
        success: false,
        message: "Office location not found. Please contact admin.",
      });
    }

    // ================================================
    // STEP 4: Calculate Distance
    // ================================================
    const distance = Attendance.calculateDistance(
      lat,
      lng,
      parseFloat(officeLocation.latitude),
      parseFloat(officeLocation.longitude),
    );

    // ================================================
    // STEP 5: Validasi Radius
    // ================================================
    if (distance > officeLocation.radius) {
      return res.status(400).json({
        success: false,
        message: `You are too far from the office`,
        data: {
          your_distance: Math.round(distance),
          required_radius: officeLocation.radius,
          distance_difference: Math.round(distance - officeLocation.radius),
          office: {
            name: officeLocation.name,
            address: officeLocation.address,
            coordinates: {
              latitude: officeLocation.latitude,
              longitude: officeLocation.longitude,
            },
          },
          message_detail: `You must be within ${officeLocation.radius} meters. You are ${Math.round(distance)} meters away.`,
        },
      });
    }

    // ================================================
    // STEP 6: Determine Status (present or late)
    // ================================================
    const now = new Date();
    const status = Attendance.determineStatus(now);

    // ================================================
    // STEP 7: Create Attendance Record
    // ================================================
    const attendance = await Attendance.checkIn({
      employee_id: employeeId,
      location_id: officeLocation.id,
      latitude: lat,
      longitude: lng,
      distance: distance.toFixed(2),
      status: status,
      notes: notes || null,
    });

    // ================================================
    // STEP 8: Success Response
    // ================================================
    return res.status(201).json({
      success: true,
      message: `Check-in successful! Status: ${status}`,
      data: {
        id: attendance.id,
        employee_id: attendance.employee_id,
        check_in_time: attendance.check_in_time,
        status: attendance.status,
        distance: Math.round(distance),
        office: {
          id: officeLocation.id,
          name: officeLocation.name,
          address: officeLocation.address,
        },
        coordinates: {
          latitude: lat,
          longitude: lng,
        },
      },
    });
  } catch (error) {
    console.error("Error in checkIn:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check in. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================================================
// ATTENDANCE CONTROLLER - Part 2
// Tambahkan ke file controllers/attendanceController.js
// ================================================

// INSTRUKSI:
// Copy semua function di bawah ini dan tambahkan ke file
// controllers/attendanceController.js setelah function checkIn

// Jangan lupa update module.exports di akhir file!

// ================================================
// CHECK-OUT
// POST /api/attendance/check-out
// Body: { latitude, longitude, notes }
// ================================================
const checkOut = async (req, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    const employeeId = req.user.id;

    // Validasi input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates format",
      });
    }

    // Cek apakah sudah check-in hari ini
    const todayAttendance = await Attendance.getTodayByEmployeeId(employeeId);

    if (!todayAttendance) {
      return res.status(400).json({
        success: false,
        message: "No check-in record found for today. Please check-in first.",
      });
    }

    // Cek apakah sudah check-out
    if (todayAttendance.check_out_time) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
        data: {
          check_out_time: todayAttendance.check_out_time,
        },
      });
    }

    // Calculate distance dari office
    const distance = Attendance.calculateDistance(
      lat,
      lng,
      parseFloat(todayAttendance.office_latitude),
      parseFloat(todayAttendance.office_longitude),
    );

    // Note: Check-out biasanya tidak strict dengan radius
    // Tapi bisa di-enable kalau perlu

    // Update attendance dengan check-out
    const updated = await Attendance.checkOut(todayAttendance.id, {
      latitude: lat,
      longitude: lng,
      distance: distance.toFixed(2),
      notes: notes || null,
    });

    // Calculate work duration
    const checkInTime = new Date(updated.check_in_time);
    const checkOutTime = new Date(updated.check_out_time);
    const durationMinutes = Math.round(
      (checkOutTime - checkInTime) / 1000 / 60,
    );
    const durationHours = (durationMinutes / 60).toFixed(2);

    return res.status(200).json({
      success: true,
      message: "Check-out successful!",
      data: {
        id: updated.id,
        check_in_time: updated.check_in_time,
        check_out_time: updated.check_out_time,
        work_duration: {
          minutes: durationMinutes,
          hours: durationHours,
          formatted: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
        },
        distance: Math.round(distance),
        office_name: todayAttendance.office_name,
      },
    });
  } catch (error) {
    console.error("Error in checkOut:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check out. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================================================
// GET TODAY'S ATTENDANCE
// GET /api/attendance/today
// ================================================
const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const attendance = await Attendance.getTodayByEmployeeId(employeeId);

    if (!attendance) {
      return res.status(200).json({
        success: true,
        message: "No attendance record for today",
        data: null,
      });
    }

    // Calculate work duration if checked out
    let workDuration = null;
    if (attendance.check_out_time) {
      const checkInTime = new Date(attendance.check_in_time);
      const checkOutTime = new Date(attendance.check_out_time);
      const minutes = Math.round((checkOutTime - checkInTime) / 1000 / 60);

      workDuration = {
        minutes: minutes,
        hours: (minutes / 60).toFixed(2),
        formatted: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        ...attendance,
        work_duration: workDuration,
      },
    });
  } catch (error) {
    console.error("Error in getTodayAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get today attendance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================================================
// GET ATTENDANCE HISTORY
// GET /api/attendance/history?limit=30&offset=0
// ================================================
const getHistory = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { limit = 30, offset = 0 } = req.query;

    // Get history
    const history = await Attendance.getHistoryByEmployeeId(
      employeeId,
      parseInt(limit),
      parseInt(offset),
    );

    // Get total count
    const total = await Attendance.countByEmployeeId(employeeId);

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total: total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get attendance history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================================================
// GET MONTHLY SUMMARY
// GET /api/attendance/summary?year=2024&month=2
// ================================================
const getMonthlySummary = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Get year and month from query, default to current
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // Validasi month
    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1-12",
      });
    }

    const summary = await Attendance.getMonthlySummary(employeeId, year, month);

    // Calculate percentage
    const totalDays = summary.total_days;
    const presentPercentage =
      totalDays > 0
        ? ((summary.present_count / totalDays) * 100).toFixed(2)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        year: year,
        month: month,
        total_days: summary.total_days,
        present: summary.present_count,
        late: summary.late_count,
        absent: summary.absent_count,
        permission: summary.permission_count,
        attendance_rate: `${presentPercentage}%`,
      },
    });
  } catch (error) {
    console.error("Error in getMonthlySummary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get monthly summary",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getHistory,
  getMonthlySummary,
};

