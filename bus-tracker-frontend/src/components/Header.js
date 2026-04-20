// src/components/Header.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/Spacing';

const Header = ({ 
  title, 
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
}) => {
  return (
    <View style={[
      styles.container, 
      transparent && styles.transparent
    ]}>
      <View style={styles.content}>
        {leftIcon && (
          <TouchableOpacity 
            onPress={onLeftPress} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={leftIcon} size={24} color={colors.text.light} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightPress} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={rightIcon} size={24} color={colors.text.light} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.light,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.glass.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;