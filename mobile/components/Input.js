// ================================================
// INPUT COMPONENT
// File: components/Input.js
// Reusable text input component
// ================================================

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';

// PENJELASAN:
// Component Input yang reusable
// Props:
// - label: Label di atas input
// - placeholder: Placeholder text
// - value: Value dari input (controlled)
// - onChangeText: Function saat text berubah
// - secureTextEntry: Boolean, untuk password
// - error: String, error message
// - leftIcon: Icon name dari Ionicons
// - editable: Boolean, bisa di-edit atau tidak
// - keyboardType: Keyboard type (default, numeric, email-address, dll)

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error = '',
  leftIcon = null,
  editable = true,
  keyboardType = 'default',
  style = {}
}) => {
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      {/* Input Container */}
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : {},
        !editable ? styles.inputDisabled : {}
      ]}>
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={COLORS.textLight} 
            style={styles.leftIcon}
          />
        )}
        
        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Password Toggle Icon */}
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  
  inputError: {
    borderColor: COLORS.error,
  },
  
  inputDisabled: {
    backgroundColor: '#F3F4F6',
  },
  
  leftIcon: {
    marginRight: 8,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
  },
  
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
  
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;

// CARA PAKAI:
// import Input from './components/Input';
//
// const [nip, setNip] = useState('');
// const [password, setPassword] = useState('');
// const [errors, setErrors] = useState({});
//
// <Input
//   label="NIP"
//   placeholder="Masukkan NIP"
//   value={nip}
//   onChangeText={setNip}
//   leftIcon="person-outline"
//   keyboardType="numeric"
//   error={errors.nip}
// />
//
// <Input
//   label="Password"
//   placeholder="Masukkan Password"
//   value={password}
//   onChangeText={setPassword}
//   leftIcon="lock-closed-outline"
//   secureTextEntry
//   error={errors.password}
// />