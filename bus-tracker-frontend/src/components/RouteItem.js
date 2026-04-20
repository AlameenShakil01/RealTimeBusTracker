// src/components/RouteItem.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import colors from '../theme/colors';
import spacing from '../theme/Spacing';

const RouteItem = ({ route, onPress, showActiveBuses = true }) => {
  const { 
    route_number, 
    route_name, 
    start_point, 
    end_point, 
    active_buses = 0,
    total_stops = 0,
    distance = null,
  } = route;

  const getBusStatusColor = () => {
    if (active_buses === 0) return colors.status.inactive;
    if (active_buses >= 3) return colors.status.active;
    return colors.status.delayed;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.routeBadge}
          >
            <Text style={styles.routeNumber}>{route_number}</Text>
          </LinearGradient>

          {showActiveBuses && (
            <View style={styles.statusBadge}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getBusStatusColor() }
                ]} 
              />
              <Text style={styles.statusText}>
                {active_buses} {active_buses === 1 ? 'Bus' : 'Buses'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.routeName} numberOfLines={1}>
          {route_name}
        </Text>

        <View style={styles.routeInfo}>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.accent.blue} />
            <Text style={styles.locationText} numberOfLines={1}>
              {start_point}
            </Text>
          </View>

          <MaterialCommunityIcons 
            name="arrow-down" 
            size={16} 
            color={colors.text.secondary} 
            style={styles.arrowIcon}
          />

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-check" size={16} color={colors.accent.purple} />
            <Text style={styles.locationText} numberOfLines={1}>
              {end_point}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="bus-stop" size={14} color={colors.text.secondary} />
            <Text style={styles.infoText}>{total_stops} stops</Text>
          </View>

          {distance && (
            <View style={styles.infoChip}>
              <MaterialCommunityIcons name="map-marker-distance" size={14} color={colors.text.secondary} />
              <Text style={styles.infoText}>{distance} km</Text>
            </View>
          )}

          <View style={styles.arrowContainer}>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={colors.text.secondary} 
            />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    minWidth: 50,
    alignItems: 'center',
  },
  routeNumber: {
    color: colors.text.light,
    fontWeight: '700',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.md,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: colors.text.light,
    fontSize: 12,
    fontWeight: '600',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.glassDark,
    marginBottom: spacing.md,
  },
  routeInfo: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text.glassDark,
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 8,
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.light,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 'auto',
  },
});

export default RouteItem;