// src/screens/public/RouteDetailsScreen.js
// Shows route info: name, start→end, list of stops, distance, time, Track Bus button

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RouteDetailsScreen = ({ route, navigation }) => {
  const routeData = route.params.route;

  // Mock stops data - TODO: Fetch from API
  const stops = [
    { id: 1, name: 'Central Station', order: 1, distance: 0 },
    { id: 2, name: 'City Mall', order: 2, distance: 2.5 },
    { id: 3, name: 'Hospital Junction', order: 3, distance: 5.8 },
    { id: 4, name: 'Tech Park Gate 1', order: 4, distance: 12.3 },
    { id: 5, name: 'University Campus', order: 5, distance: 18.7 },
    { id: 6, name: 'International Airport', order: 6, distance: 25 },
  ];

  const handleTrackBus = () => {
    if (routeData.active_buses === 0) {
      Alert.alert('No Active Buses', 'There are currently no buses running on this route.');
      return;
    }

    // TODO: Get actual bus_id from API
    navigation.navigate('LiveTrackingScreen', {
      bus_id: 'mock_bus_123',
      route_id: routeData.id,
      route_number: routeData.route_number,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8b5cf6" />

      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.routeBadge}>
            <Text style={styles.routeNumber}>{routeData.route_number}</Text>
          </View>
          <Text style={styles.routeName}>{routeData.route_name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Route Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Starting Point</Text>
              <Text style={styles.infoValue}>{routeData.start_point}</Text>
            </View>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-check" size={20} color="#8b5cf6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{routeData.end_point}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="bus-stop" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{routeData.total_stops}</Text>
            <Text style={styles.statLabel}>Stops</Text>
          </View>

          <View style={styles.statBox}>
            <MaterialCommunityIcons name="road-variant" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{routeData.distance} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statBox}>
            <MaterialCommunityIcons name="bus-clock" size={24} color="#10b981" />
            <Text style={styles.statValue}>{routeData.active_buses}</Text>
            <Text style={styles.statLabel}>Active Buses</Text>
          </View>
        </View>

        {/* Estimated Time */}
        <View style={styles.timeCard}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#f59e0b" />
          <View style={styles.timeContent}>
            <Text style={styles.timeLabel}>Estimated Travel Time</Text>
            <Text style={styles.timeValue}>~45 minutes</Text>
          </View>
        </View>

        {/* Stops List */}
        <View style={styles.stopsSection}>
          <Text style={styles.sectionTitle}>Route Stops</Text>

          {stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopIndicator}>
                {index === 0 ? (
                  <View style={styles.startDot} />
                ) : index === stops.length - 1 ? (
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#8b5cf6"
                  />
                ) : (
                  <View style={styles.middleDot} />
                )}
                {index < stops.length - 1 && <View style={styles.connector} />}
              </View>

              <View style={styles.stopContent}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopDistance}>{stop.distance} km</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Track Bus Button - Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.trackButton,
            routeData.active_buses === 0 && styles.trackButtonDisabled,
          ]}
          onPress={handleTrackBus}
          disabled={routeData.active_buses === 0}
        >
          <LinearGradient
            colors={
              routeData.active_buses > 0
                ? ['#10b981', '#059669']
                : ['#9ca3af', '#6b7280']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trackButtonGradient}
          >
            <MaterialCommunityIcons name="map-marker-path" size={24} color="#ffffff" />
            <Text style={styles.trackButtonText}>
              {routeData.active_buses > 0 ? 'Track Bus Live' : 'No Buses Available'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  routeNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  dashedLine: {
    height: 30,
    width: 2,
    marginLeft: 10,
    marginVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  stopsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stopIndicator: {
    width: 30,
    alignItems: 'center',
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  middleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  stopDistance: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  trackButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  trackButtonDisabled: {
    opacity: 0.6,
  },
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  trackButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default RouteDetailsScreen;