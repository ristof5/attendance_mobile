// ================================================
// API SERVICE
// File: services/api.js
// Setup axios untuk HTTP requests
// ================================================

import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getToken, deleteToken } from '../utils/storage';

// PENJELASAN:
// Axios adalah library untuk HTTP requests (seperti fetch tapi lebih powerful)
// Kita setup interceptor untuk:
// 1. Auto attach token di header
// 2. Handle error secara global
// 3. Auto refresh token kalau expired (nanti)

// ================================================
// CREATE AXIOS INSTANCE
// ================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// ================================================
// REQUEST INTERCEPTOR
// ================================================
// Interceptor ini jalan SEBELUM request dikirim
// Kita pakai untuk attach token ke header

api.interceptors.request.use(
  async (config) => {
    // Get token dari storage
    const token = await getToken();
    
    // Kalau ada token, attach ke header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request (development only)
    if (__DEV__) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📦 Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ================================================
// RESPONSE INTERCEPTOR
// ================================================
// Interceptor ini jalan SETELAH response diterima
// Kita pakai untuk handle error secara global

api.interceptors.response.use(
  (response) => {
    // Log response (development only)
    if (__DEV__) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`);
      console.log('📦 Response:', response.data);
    }
    
    return response;
  },
  async (error) => {
    // Log error
    if (__DEV__) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
    
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;
      
      // 401 Unauthorized - Token invalid atau expired
      if (status === 401) {
        // Delete token dan redirect ke login
        await deleteToken();
        // Nanti di sini kita bisa dispatch action untuk logout
        // atau navigate ke login screen
      }
      
      // 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      // 404 Not Found
      if (status === 404) {
        console.error('Resource not found');
      }
      
      // 500 Internal Server Error
      if (status >= 500) {
        console.error('Server error');
      }
    }
    
    return Promise.reject(error);
  }
);

// ================================================
// API METHODS
// ================================================

/**
 * GET request
 */
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST request
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export axios instance juga kalau perlu custom config
export default api;

// CARA PAKAI:
// import { get, post } from './services/api';
//
// const data = await get('/attendance/today');
// const response = await post('/auth/login', { nip: 'EMP001', password: '123' });