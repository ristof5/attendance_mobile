// ================================================
// STORAGE HELPER
// File: utils/storage.js
// Helper untuk save/load data dengan SecureStore
// ================================================

import * as SecureStore from 'expo-secure-store';

// PENJELASAN:
// SecureStore itu kayak localStorage tapi lebih aman
// Data di-encrypt dan tersimpan secure di device
// Cocok untuk simpan token JWT dan data sensitif

// ================================================
// SAVE DATA
// ================================================
export const saveData = async (key, value) => {
  try {
    // Convert object to string
    const stringValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    await SecureStore.setItemAsync(key, stringValue);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// ================================================
// GET DATA
// ================================================
export const getData = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    
    if (!value) return null;
    
    // Try parse as JSON, kalau gagal return as string
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

// ================================================
// DELETE DATA
// ================================================
export const deleteData = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error('Error deleting data:', error);
    return false;
  }
};

// ================================================
// CLEAR ALL DATA
// ================================================
export const clearAllData = async () => {
  try {
    // SecureStore tidak punya clear all function
    // Jadi kita harus delete satu per satu
    // Atau simpan list of keys yang pernah disave
    
    // Untuk sekarang, kita clear yang penting aja
    const { STORAGE_KEYS } = require('../constants/config');
    
    await deleteData(STORAGE_KEYS.TOKEN);
    await deleteData(STORAGE_KEYS.USER);
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// ================================================
// AUTH SPECIFIC HELPERS
// ================================================

/**
 * Save auth token
 */
export const saveToken = async (token) => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await saveData(STORAGE_KEYS.TOKEN, token);
};

/**
 * Get auth token
 */
export const getToken = async () => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await getData(STORAGE_KEYS.TOKEN);
};

/**
 * Delete auth token
 */
export const deleteToken = async () => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await deleteData(STORAGE_KEYS.TOKEN);
};

/**
 * Save user data
 */
export const saveUser = async (user) => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await saveData(STORAGE_KEYS.USER, user);
};

/**
 * Get user data
 */
export const getUser = async () => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await getData(STORAGE_KEYS.USER);
};

/**
 * Delete user data
 */
export const deleteUser = async () => {
  const { STORAGE_KEYS } = require('../constants/config');
  return await deleteData(STORAGE_KEYS.USER);
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token; // Convert to boolean
};

export default {
  saveData,
  getData,
  deleteData,
  clearAllData,
  saveToken,
  getToken,
  deleteToken,
  saveUser,
  getUser,
  deleteUser,
  isLoggedIn
};