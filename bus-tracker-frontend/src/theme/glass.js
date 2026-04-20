// src/theme/glass.js

import { Platform } from 'react-native';

export const glassEffect = {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
};

export const glassEffectDark = {
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
};

export const glassCard = {
  ...glassEffect,
  padding: 16,
  marginVertical: 8,
};

export const glassButton = {
  ...glassEffect,
  paddingVertical: 14,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
};

export const blurIntensity = Platform.select({
  ios: 'light',
  android: 'light',
});