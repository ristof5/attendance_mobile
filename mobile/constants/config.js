// ================================================
// CONFIG & CONSTANTS - Updated for Expo Go
// File: constants/config.js
// Konfigurasi untuk aplikasi
// ================================================

// ================================================
// CARA SETUP API_BASE_URL UNTUK EXPO GO
// ================================================

// LANGKAH 1: CEK IP ADDRESS LAPTOP ANDA
// Windows: buka CMD, ketik: ipconfig
// Mac/Linux: buka Terminal, ketik: ifconfig
// Cari "IPv4 Address" atau "inet" (contoh: 192.168.1.100)

// LANGKAH 2: GANTI IP_ADDRESS_LAPTOP dengan IP Anda
const IP_ADDRESS_LAPTOP = '10.214.137.191'; // ← GANTI INI dengan IP laptop Anda!
const BACKEND_PORT = 3000;

// ================================================
// IMPORTANT - NETWORK REQUIREMENTS UNTUK EXPO GO:
// ================================================
// 1. Laptop dan HP harus terhubung ke WiFi yang SAMA
// 2. Pastikan backend (npm run dev) sudah running
// 3. Test di browser: http://[IP_LAPTOP]:3000 (harus bisa dibuka)
// 4. Kalau tidak bisa, cek firewall laptop Anda

// ================================================
// API CONFIGURATION
// ================================================

// Untuk Expo Go, HARUS pakai IP laptop Anda
export const API_BASE_URL = `http://${IP_ADDRESS_LAPTOP}:${BACKEND_PORT}/api`;

// DEBUGGING: Print URL di console
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📱 Pastikan backend running di:', `http://${IP_ADDRESS_LAPTOP}:${BACKEND_PORT}`);

// ================================================
// APP CONFIGURATION
// ================================================

export const APP_NAME = 'Employee Attendance';
export const APP_VERSION = '1.0.0';

// ================================================
// STORAGE KEYS
// ================================================
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REMEMBER_NIP: 'remember_nip'
};

// ================================================
// ATTENDANCE CONFIGURATION
// ================================================
export const ATTENDANCE_CONFIG = {
  // Jam kerja (untuk tampilan)
  WORK_START_TIME: '08:00',
  WORK_END_TIME: '17:00',
  
  // Default radius (meter)
  DEFAULT_RADIUS: 100,
  
  // Location request settings
  LOCATION_ACCURACY: 'high', // high, balanced, low
  LOCATION_TIMEOUT: 10000, // 10 seconds
};

// ================================================
// COLORS (sesuai dengan desain Figma)
// ================================================
export const COLORS = {
  primary: '#EF4444', // Red dari desain Figma
  secondary: '#B45858', // Dark red
  background: '#FFFFFF',
  text: '#000000',
  textLight: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  border: '#E5E7EB',
  disabled: '#9CA3AF'
};

// ================================================
// API ENDPOINTS
// ================================================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',
  
  // Attendance
  CHECK_IN: '/attendance/check-in',
  CHECK_OUT: '/attendance/check-out',
  TODAY: '/attendance/today',
  HISTORY: '/attendance/history',
  SUMMARY: '/attendance/summary',
  
  // Locations
  LOCATIONS: '/locations'
};

// ================================================
// ERROR MESSAGES
// ================================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  INVALID_CREDENTIALS: 'NIP atau password salah.',
  TOKEN_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  LOCATION_PERMISSION_DENIED: 'Izin lokasi diperlukan untuk absensi.',
  LOCATION_UNAVAILABLE: 'Lokasi tidak tersedia. Pastikan GPS aktif.',
  ALREADY_CHECKED_IN: 'Anda sudah melakukan check-in hari ini.',
  NOT_CHECKED_IN: 'Anda belum melakukan check-in hari ini.',
  OUT_OF_RANGE: 'Anda berada di luar jangkauan kantor.',
  UNKNOWN_ERROR: 'Terjadi kesalahan. Silakan coba lagi.'
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Format waktu untuk display
 */
export const formatTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Format tanggal untuk display
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Test connection to backend
 */
export const testConnection = async () => {
  try {
    const response = await fetch(API_BASE_URL.replace('/api', ''));
    if (response.ok) {
      console.log('✅ Backend connection successful!');
      return true;
    }
    console.error('❌ Backend returned error:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    console.error('💡 Troubleshooting:');
    console.error('   1. Pastikan backend running (npm run dev)');
    console.error('   2. Cek IP address laptop di config.js');
    console.error('   3. Laptop dan HP terhubung ke WiFi yang sama');
    console.error('   4. Test di browser:', API_BASE_URL.replace('/api', ''));
    return false;
  }
};

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  STORAGE_KEYS,
  ATTENDANCE_CONFIG,
  COLORS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  getApiUrl,
  formatTime,
  formatDate,
  testConnection
};