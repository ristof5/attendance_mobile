// ================================================
// AUTH SERVICE
// File: services/authService.js
// Handle authentication operations
// ================================================

import { post, get } from './api';
import { API_ENDPOINTS } from '../constants/config';
import { saveToken, saveUser, getUser, deleteToken, deleteUser } from '../utils/storage';

// PENJELASAN:
// Service ini adalah wrapper untuk auth-related API calls
// Semua function authentication ada di sini
// Controller/Screen tinggal panggil function ini

// ================================================
// LOGIN
// ================================================
export const login = async (nip, password) => {
  try {
    // Validasi input
    if (!nip || !password) {
      throw new Error('NIP dan password harus diisi');
    }
    
    // Call API
    const response = await post(API_ENDPOINTS.LOGIN, {
      nip,
      password
    });
    
    // Check response
    if (response.success && response.data) {
      const { token, user } = response.data;
      
      // Save token dan user data ke secure storage
      await saveToken(token);
      await saveUser(user);
      
      return {
        success: true,
        user,
        message: 'Login berhasil'
      };
    } else {
      throw new Error(response.message || 'Login gagal');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('NIP atau password salah');
      }
      
      if (status === 400) {
        throw new Error(data.message || 'Data tidak valid');
      }
      
      throw new Error(data.message || 'Login gagal');
    }
    
    // Network error
    if (error.message === 'Network Error') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    
    throw error;
  }
};

// ================================================
// LOGOUT
// ================================================
export const logout = async () => {
  try {
    // Call API (optional - JWT adalah stateless)
    try {
      await post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Ignore API error, tetap logout
      console.log('Logout API call failed, but continuing with local logout');
    }
    
    // Clear token dan user data dari storage
    await deleteToken();
    await deleteUser();
    
    return {
      success: true,
      message: 'Logout berhasil'
    };
    
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// ================================================
// GET PROFILE
// ================================================
export const getProfile = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROFILE);
    
    if (response.success && response.data) {
      // Update user data di storage
      await saveUser(response.data);
      
      return {
        success: true,
        user: response.data
      };
    } else {
      throw new Error(response.message || 'Gagal mengambil data profile');
    }
    
  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error.response?.status === 401) {
      // Token invalid, logout
      await logout();
      throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }
    
    throw error;
  }
};

// ================================================
// GET CURRENT USER FROM STORAGE
// ================================================
export const getCurrentUser = async () => {
  try {
    const user = await getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// ================================================
// CHECK AUTH STATUS
// ================================================
export const checkAuth = async () => {
  try {
    // Coba get profile untuk validasi token
    const result = await getProfile();
    return {
      isAuthenticated: true,
      user: result.user
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null
    };
  }
};

export default {
  login,
  logout,
  getProfile,
  getCurrentUser,
  checkAuth
};

// CARA PAKAI:
// import authService from './services/authService';
//
// // Login
// try {
//   const result = await authService.login('EMP001', 'password123');
//   console.log(result.user);
// } catch (error) {
//   console.error(error.message);
// }
//
// // Logout
// await authService.logout();
//
// // Get profile
// const profile = await authService.getProfile();