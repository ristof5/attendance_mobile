// ================================================
// LOGIN SCREEN
// File: app/(auth)/login.js
// Screen untuk login dengan NIP dan Password
// ================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

// Import components & services
import Button from '../../components/Button';
import Input from '../../components/Input';
import authService from '../../services/authService';
import { COLORS, APP_NAME } from '../../constants/config';

// PENJELASAN FLOW:
// 1. User input NIP & Password
// 2. Validasi input
// 3. Call authService.login()
// 4. Kalau berhasil, navigate ke dashboard
// 5. Kalau gagal, tampilkan error

const LoginScreen = () => {
  const router = useRouter();
  
  // State untuk form
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // ================================================
  // VALIDATE FORM
  // ================================================
  const validateForm = () => {
    const newErrors = {};
    
    // Validasi NIP
    if (!nip.trim()) {
      newErrors.nip = 'NIP harus diisi';
    } else if (nip.length < 3) {
      newErrors.nip = 'NIP minimal 3 karakter';
    }
    
    // Validasi Password
    if (!password) {
      newErrors.password = 'Password harus diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    
    // Return true jika tidak ada error
    return Object.keys(newErrors).length === 0;
  };
  
  // ================================================
  // HANDLE LOGIN
  // ================================================
  const handleLogin = async () => {
    try {
      // Clear errors sebelumnya
      setErrors({});
      
      // Validasi form
      if (!validateForm()) {
        return;
      }
      
      // Set loading
      setLoading(true);
      
      // Call login service
      const result = await authService.login(nip.trim(), password);
      
      // Login berhasil
      console.log('Login success:', result.user);
      
      // Navigate ke dashboard
      // NOTE: Sesuaikan dengan routing structure Anda
      router.replace('/(tabs)'); // atau router.replace('/dashboard')
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Tampilkan error ke user
      Alert.alert(
        'Login Gagal',
        error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
      
    } finally {
      setLoading(false);
    }
  };
  
  // ================================================
  // RENDER
  // ================================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Logo atau Icon bisa ditambahkan di sini */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📍</Text>
          </View>
          
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>
            Sistem Absensi Karyawan
          </Text>
        </View>
        
        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login</Text>
          <Text style={styles.formSubtitle}>
            Masukkan NIP dan password Anda
          </Text>
          
          {/* Input NIP */}
          <Input
            label="NIP"
            placeholder="Contoh: EMP001"
            value={nip}
            onChangeText={(text) => {
              setNip(text);
              // Clear error saat user mulai mengetik
              if (errors.nip) {
                setErrors({ ...errors, nip: '' });
              }
            }}
            leftIcon="person-outline"
            keyboardType="default"
            error={errors.nip}
            editable={!loading}
          />
          
          {/* Input Password */}
          <Input
            label="Password"
            placeholder="Masukkan password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              // Clear error saat user mulai mengetik
              if (errors.password) {
                setErrors({ ...errors, password: '' });
              }
            }}
            leftIcon="lock-closed-outline"
            secureTextEntry
            error={errors.password}
            editable={!loading}
          />
          
          {/* Login Button */}
          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
          
          {/* Info Text */}
          <Text style={styles.infoText}>
            Hubungi admin jika Anda lupa password
          </Text>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  logoText: {
    fontSize: 40,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  
  // Form
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  
  loginButton: {
    marginTop: 8,
  },
  
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Footer
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 24,
  },
  
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default LoginScreen;

// TESTING:
// Untuk test, pakai credentials dari database:
// NIP: EMP001
// Password: password123
//
// NIP: EMP002
// Password: password123