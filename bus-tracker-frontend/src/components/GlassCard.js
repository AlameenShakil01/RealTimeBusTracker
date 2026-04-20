// src/components/GlassCard.js

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import spacing from '../theme/Spacing';

const GlassCard = ({ 
  children, 
  style, 
  gradient = false,
  gradientColors = colors.gradients.primary,
}) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientCard, style]}
      >
        <View style={styles.gradientInner}>
          {children}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: colors.glass.background,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.cardPadding,
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
  },
  gradientCard: {
    borderRadius: spacing.borderRadius.lg,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradientInner: {
    borderRadius: spacing.borderRadius.lg - 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.cardPadding,
  },
});

export default GlassCard;