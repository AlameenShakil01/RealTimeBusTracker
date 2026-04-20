// src/components/GlassButton.js

import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Platform,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import spacing from '../theme/Spacing';

const GlassButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  icon,
  loading = false,
  disabled = false,
  variant = 'glass', // 'glass', 'gradient', 'outline'
  gradientColors = colors.gradients.primary,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  const textSizeStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.baseButton,
              sizeStyles[size],
              disabled && styles.disabled,
              style,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.light} />
            ) : (
              <>
                {icon && icon}
                <Text style={[styles.buttonText, textSizeStyles[size], textStyle]}>
                  {title}
                </Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.baseButton,
            styles.outlineButton,
            sizeStyles[size],
            disabled && styles.disabled,
            { transform: [{ scale: scaleValue }] },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.accent.purple} />
          ) : (
            <>
              {icon && icon}
              <Text style={[styles.outlineText, textSizeStyles[size], textStyle]}>
                {title}
              </Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Default glass variant
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.baseButton,
          styles.glassButton,
          sizeStyles[size],
          disabled && styles.disabled,
          { transform: [{ scale: scaleValue }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.light} />
        ) : (
          <>
            {icon && icon}
            <Text style={[styles.buttonText, textSizeStyles[size], textStyle]}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  glassButton: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.purple,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: colors.text.light,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.accent.purple,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassButton;