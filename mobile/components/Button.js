// ================================================
// BUTTON COMPONENT
// File: components/Button.js
// Reusable button component
// ================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/config';

// PENJELASAN:
// Component Button yang reusable
// Props:
// - title: Text di button
// - onPress: Function yang dipanggil saat button di-tap
// - loading: Boolean, tampilkan loading indicator
// - disabled: Boolean, disable button
// - variant: 'primary' | 'secondary' | 'outline'
// - style: Custom style tambahan

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style = {},
  textStyle = {}
}) => {
  
  // Tentukan style berdasarkan variant
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineButton);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  
  // Text styles
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  primaryText: {
    color: '#FFFFFF',
  },
  
  secondaryText: {
    color: '#FFFFFF',
  },
  
  outlineText: {
    color: COLORS.primary,
  },
  
  disabledText: {
    color: '#999999',
  },
});

export default Button;

// CARA PAKAI:
// import Button from './components/Button';
//
// <Button 
//   title="Login"
//   onPress={handleLogin}
//   loading={isLoading}
// />
//
// <Button 
//   title="Cancel"
//   variant="outline"
//   onPress={handleCancel}
// />
//
// <Button 
//   title="Submit"
//   disabled={!isValid}
//   onPress={handleSubmit}
// />