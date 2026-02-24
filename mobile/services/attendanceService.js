// ================================================
// ATTENDANCE SERVICE
// File: services/attendanceService.js
// Handle attendance operations
// ================================================

import { get, post } from './api';
import { API_ENDPOINTS } from '../constants/config';
import locationService from './locationService';

// PENJELASAN:
// Service ini handle semua operasi attendance
// - Check-in dengan geolocation validation
// - Check-out
// - Get today's attendance
// - Get history
// - Get summary

// ================================================
// GET OFFICE LOCATIONS
// ================================================
export const getOfficeLocations = async () => {
  try {
    const response = await get(API_ENDPOINTS.LOCATIONS);
    
    if (response.success && response.data) {
      return {
        success: true,
        locations: response.data
      };
    }
    
    throw new Error(response.message || 'Gagal mengambil data lokasi');
    
  } catch (error) {
    console.error('Get office locations error:', error);
    throw error;
  }
};

// ================================================
// CHECK-IN
// ================================================
export const checkIn = async (locationId = null, notes = '') => {
  try {
    // Step 1: Get office locations
    const locationsResult = await getOfficeLocations();
    
    let selectedLocation;
    if (locationId) {
      selectedLocation = locationsResult.locations.find(loc => loc.id === locationId);
    } else {
      // Pakai location pertama (default)
      selectedLocation = locationsResult.locations[0];
    }
    
    if (!selectedLocation) {
      throw new Error('Lokasi kantor tidak ditemukan');
    }
    
    // Step 2: Get current location & validate
    const validation = await locationService.getLocationAndValidate(selectedLocation);
    
    if (!validation.success) {
      throw new Error('Gagal mendapatkan lokasi Anda');
    }
    
    // Step 3: Check if within radius
    if (!validation.validation.isWithin) {
      const { distance, radius, difference } = validation.validation;
      
      throw new Error(
        `Anda berada di luar jangkauan kantor.\n` +
        `Jarak Anda: ${distance}m\n` +
        `Radius maksimal: ${radius}m\n` +
        `Selisih: ${difference}m`
      );
    }
    
    // Step 4: Call API check-in
    const response = await post(API_ENDPOINTS.CHECK_IN, {
      latitude: validation.location.latitude,
      longitude: validation.location.longitude,
      location_id: selectedLocation.id,
      notes: notes
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Check-in berhasil!',
        location: selectedLocation,
        distance: validation.validation.distance
      };
    }
    
    throw new Error(response.message || 'Check-in gagal');
    
  } catch (error) {
    console.error('Check-in error:', error);
    
    // Handle specific API errors
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        // Already checked in or out of range
        throw new Error(data.message || 'Check-in gagal');
      }
      
      throw new Error(data.message || 'Check-in gagal');
    }
    
    throw error;
  }
};

// ================================================
// CHECK-OUT
// ================================================
export const checkOut = async (notes = '') => {
  try {
    // Get current location
    const locationResult = await locationService.getCurrentLocation();
    
    if (!locationResult.success) {
      throw new Error('Gagal mendapatkan lokasi Anda');
    }
    
    // Call API check-out
    const response = await post(API_ENDPOINTS.CHECK_OUT, {
      latitude: locationResult.latitude,
      longitude: locationResult.longitude,
      notes: notes
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Check-out berhasil!'
      };
    }
    
    throw new Error(response.message || 'Check-out gagal');
    
  } catch (error) {
    console.error('Check-out error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        throw new Error(data.message || 'Check-out gagal');
      }
      
      throw new Error(data.message || 'Check-out gagal');
    }
    
    throw error;
  }
};

// ================================================
// GET TODAY'S ATTENDANCE
// ================================================
export const getTodayAttendance = async () => {
  try {
    const response = await get(API_ENDPOINTS.TODAY);
    
    if (response.success) {
      return {
        success: true,
        data: response.data, // bisa null kalau belum check-in
        hasCheckedIn: response.data !== null,
        hasCheckedOut: response.data?.check_out_time !== null
      };
    }
    
    throw new Error(response.message || 'Gagal mengambil data absensi hari ini');
    
  } catch (error) {
    console.error('Get today attendance error:', error);
    throw error;
  }
};

// ================================================
// GET ATTENDANCE HISTORY
// ================================================
export const getAttendanceHistory = async (limit = 30, offset = 0) => {
  try {
    const response = await get(`${API_ENDPOINTS.HISTORY}?limit=${limit}&offset=${offset}`);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        pagination: response.pagination
      };
    }
    
    throw new Error(response.message || 'Gagal mengambil riwayat absensi');
    
  } catch (error) {
    console.error('Get attendance history error:', error);
    throw error;
  }
};

// ================================================
// GET MONTHLY SUMMARY
// ================================================
export const getMonthlySummary = async (year = null, month = null) => {
  try {
    // Default ke bulan ini kalau tidak ada parameter
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || (now.getMonth() + 1);
    
    const response = await get(`${API_ENDPOINTS.SUMMARY}?year=${targetYear}&month=${targetMonth}`);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    throw new Error(response.message || 'Gagal mengambil ringkasan bulanan');
    
  } catch (error) {
    console.error('Get monthly summary error:', error);
    throw error;
  }
};

// ================================================
// CHECK CAN CHECK-IN
// Helper untuk cek apakah bisa check-in atau tidak
// ================================================
export const canCheckIn = async () => {
  try {
    const today = await getTodayAttendance();
    
    return {
      canCheckIn: !today.hasCheckedIn,
      reason: today.hasCheckedIn ? 'Anda sudah check-in hari ini' : null
    };
    
  } catch (error) {
    console.error('Check can check-in error:', error);
    return {
      canCheckIn: true, // Default allow kalau error
      reason: null
    };
  }
};

// ================================================
// CHECK CAN CHECK-OUT
// Helper untuk cek apakah bisa check-out atau tidak
// ================================================
export const canCheckOut = async () => {
  try {
    const today = await getTodayAttendance();
    
    if (!today.hasCheckedIn) {
      return {
        canCheckOut: false,
        reason: 'Anda belum check-in hari ini'
      };
    }
    
    if (today.hasCheckedOut) {
      return {
        canCheckOut: false,
        reason: 'Anda sudah check-out hari ini'
      };
    }
    
    return {
      canCheckOut: true,
      reason: null
    };
    
  } catch (error) {
    console.error('Check can check-out error:', error);
    return {
      canCheckOut: false,
      reason: 'Gagal memeriksa status absensi'
    };
  }
};

export default {
  getOfficeLocations,
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getMonthlySummary,
  canCheckIn,
  canCheckOut
};

// CARA PAKAI:
// import attendanceService from './services/attendanceService';
//
// // Check-in
// try {
//   const result = await attendanceService.checkIn(1, 'Check-in pagi');
//   console.log(result.message);
// } catch (error) {
//   console.error(error.message);
// }
//
// // Check-out
// const checkOut = await attendanceService.checkOut('Pulang');
//
// // Get today
// const today = await attendanceService.getTodayAttendance();
// console.log(today.hasCheckedIn); // true/false
//
// // Get history
// const history = await attendanceService.getAttendanceHistory(10, 0);