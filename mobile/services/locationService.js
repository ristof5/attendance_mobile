// ================================================
// LOCATION SERVICE
// File: services/locationService.js
// Handle geolocation dengan Expo Location
// ================================================

import * as Location from 'expo-location';
import { ATTENDANCE_CONFIG } from '../constants/config';

// PENJELASAN:
// Service ini handle semua yang berhubungan dengan GPS
// - Request permission
// - Get current location
// - Calculate distance
// - Check if within radius

// ================================================
// REQUEST LOCATION PERMISSION
// ================================================
export const requestLocationPermission = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        success: false,
        message: 'Izin lokasi diperlukan untuk melakukan absensi'
      };
    }
    
    return {
      success: true,
      message: 'Izin lokasi diberikan'
    };
    
  } catch (error) {
    console.error('Request permission error:', error);
    return {
      success: false,
      message: 'Gagal meminta izin lokasi'
    };
  }
};

// ================================================
// CHECK LOCATION PERMISSION STATUS
// ================================================
export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Check permission error:', error);
    return false;
  }
};

// ================================================
// GET CURRENT LOCATION
// ================================================
export const getCurrentLocation = async () => {
  try {
    // Check permission first
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      const permissionResult = await requestLocationPermission();
      if (!permissionResult.success) {
        throw new Error(permissionResult.message);
      }
    }
    
    // Get location dengan accuracy tinggi
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 1
    });
    
    const { latitude, longitude } = location.coords;
    
    return {
      success: true,
      latitude,
      longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
    
  } catch (error) {
    console.error('Get location error:', error);
    
    // Handle specific errors
    if (error.message.includes('Location services are disabled')) {
      throw new Error('GPS tidak aktif. Silakan aktifkan GPS terlebih dahulu.');
    }
    
    if (error.message.includes('Location request timed out')) {
      throw new Error('Timeout mendapatkan lokasi. Pastikan Anda berada di area terbuka.');
    }
    
    throw new Error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
  }
};

// ================================================
// CALCULATE DISTANCE (Haversine Formula)
// ================================================
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula untuk hitung jarak antara 2 koordinat GPS
  // Result dalam meter
  
  const R = 6371e3; // Earth radius dalam meter
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  
  return Math.round(distance); // Round to nearest meter
};

// ================================================
// CHECK IF WITHIN RADIUS
// ================================================
export const isWithinRadius = (userLat, userLng, officeLat, officeLng, radius) => {
  const distance = calculateDistance(userLat, userLng, officeLat, officeLng);
  
  return {
    isWithin: distance <= radius,
    distance: distance,
    radius: radius,
    difference: distance - radius
  };
};

// ================================================
// GET LOCATION WITH VALIDATION
// Helper yang menggabungkan get location + validation
// ================================================
export const getLocationAndValidate = async (officeLocation) => {
  try {
    // Get current location
    const locationResult = await getCurrentLocation();
    
    if (!locationResult.success) {
      throw new Error('Gagal mendapatkan lokasi');
    }
    
    const { latitude, longitude, accuracy } = locationResult;
    
    // Check accuracy (optional)
    // Kalau accuracy terlalu rendah, bisa kasih warning
    if (accuracy > 50) {
      console.warn('GPS accuracy low:', accuracy);
    }
    
    // Validate if office location provided
    if (officeLocation) {
      const validation = isWithinRadius(
        latitude,
        longitude,
        officeLocation.latitude,
        officeLocation.longitude,
        officeLocation.radius
      );
      
      return {
        success: true,
        location: {
          latitude,
          longitude,
          accuracy
        },
        validation: {
          isWithin: validation.isWithin,
          distance: validation.distance,
          radius: validation.radius,
          difference: validation.difference
        },
        office: officeLocation
      };
    }
    
    // Return location only jika tidak ada office location
    return {
      success: true,
      location: {
        latitude,
        longitude,
        accuracy
      }
    };
    
  } catch (error) {
    console.error('Get location and validate error:', error);
    throw error;
  }
};

// ================================================
// WATCH LOCATION (untuk realtime tracking)
// ================================================
// Note: Ini optional, bisa dipakai kalau mau live tracking
let locationSubscription = null;

export const startWatchingLocation = async (callback) => {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }
    
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10 // Update every 10 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        callback({
          latitude,
          longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        });
      }
    );
    
    return true;
  } catch (error) {
    console.error('Watch location error:', error);
    return false;
  }
};

export const stopWatchingLocation = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};

export default {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  calculateDistance,
  isWithinRadius,
  getLocationAndValidate,
  startWatchingLocation,
  stopWatchingLocation
};

// CARA PAKAI:
// import locationService from './services/locationService';
//
// // Get current location
// const result = await locationService.getCurrentLocation();
// console.log(result.latitude, result.longitude);
//
// // Validate with office location
// const validation = await locationService.getLocationAndValidate({
//   latitude: -6.2088,
//   longitude: 106.8456,
//   radius: 100
// });
//
// if (validation.validation.isWithin) {
//   console.log('Dalam radius!');
// } else {
//   console.log('Di luar radius:', validation.validation.distance, 'meter');
// }