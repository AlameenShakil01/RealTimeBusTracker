// src/screens/driver/ActiveTripScreen.js
// Screen driver sees after tapping "Start Trip" - GPS broadcasting

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import locationService from '../../services/LocationService';
// import io from 'socket.io-client';

const ActiveTripScreen = ({ route, navigation }) => {
  const { trip_id, bus_id, route_number } = route.params;

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('good'); // 'good' | 'lost'
  const [tripDuration, setTripDuration] = useState(0);
  const [location, setLocation] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  // Trip duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTripDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // GPS Broadcasting every 5 seconds
  useEffect(() => {
    let socket = null;
    let gpsInterval = null;

    const startBroadcasting = async () => {
      try {
        // TODO: Connect to WebSocket
        // socket = io('YOUR_BACKEND_URL');
        // socket.emit('join-trip', { trip_id, bus_id });

        gpsInterval = setInterval(async () => {
          try {
            const loc = await locationService.getCurrentLocation();
            
            if (loc) {
              setLocation(loc);
              setCurrentSpeed(loc.speed || 0);
              setGpsStatus('good');

              // TODO: Send to backend via WebSocket
              // socket.emit('location-update', {
              //   trip_id,
              //   bus_id,
              //   latitude: loc.latitude,
              //   longitude: loc.longitude,
              //   speed: loc.speed || 0,
              //   bearing: loc.heading || 0,
              //   timestamp: Date.now()
              // });

              console.log('GPS Update sent:', {
                trip_id,
                lat: loc.latitude,
                lng: loc.longitude,
                speed: loc.speed,
              });
            } else {
              setGpsStatus('lost');
            }
          } catch (error) {
            console.error('GPS Error:', error);
            setGpsStatus('lost');
          }
        }, 5000); // Every 5 seconds

      } catch (error) {
        console.error('Broadcasting error:', error);
      }
    };

    startBroadcasting();

    return () => {
      if (gpsInterval) clearInterval(gpsInterval);
      if (socket) {
        // socket.emit('leave-trip', { trip_id });
        // socket.disconnect();
      }
    };
  }, [trip_id, bus_id]);

  const handleStopTrip = () => {
    Alert.alert(
      'Stop Trip',
      'Are you sure you want to stop this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Trip',
          style: 'destructive',
          onPress: async () => {
            setIsBroadcasting(false);
            
            // TODO: API call to stop trip
            // await stopTrip(trip_id);

            Alert.alert('Trip Stopped', 'Trip has been completed successfully', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('DriverDashboard'),
              },
            ]);
          },
        },
      ]
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />

      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Trip in Progress</Text>
            <Text style={styles.headerSubtitle}>Route {route_number}</Text>
          </View>

          <View style={styles.durationBadge}>
            <MaterialCommunityIcons name="timer" size={16} color="#10b981" />
            <Text style={styles.durationText}>{formatDuration(tripDuration)}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* GPS Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons
              name={gpsStatus === 'good' ? 'signal' : 'signal-off'}
              size={32}
              color={gpsStatus === 'good' ? '#10b981' : '#ef4444'}
            />
            <Text style={styles.statusTitle}>
              {gpsStatus === 'good' ? 'GPS Signal Good' : 'GPS Signal Lost'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: gpsStatus === 'good' ? '#10b981' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {gpsStatus === 'good'
                ? '✓ Broadcasting location every 5 seconds'
                : '✗ Unable to get GPS location'}
            </Text>
          </View>

          {location && (
            <View style={styles.coordsContainer}>
              <Text style={styles.coordLabel}>Current Position:</Text>
              <Text style={styles.coordValue}>
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Speed Card */}
        <View style={styles.speedCard}>
          <Text style={styles.speedLabel}>Current Speed</Text>
          <View style={styles.speedDisplay}>
            <Text style={styles.speedValue}>{Math.round(currentSpeed)}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        {/* Trip Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Trip Information</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="bus" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Bus ID:</Text>
            <Text style={styles.infoValue}>{bus_id}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="routes" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Route:</Text>
            <Text style={styles.infoValue}>{route_number}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-path" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Trip ID:</Text>
            <Text style={styles.infoValue}>{trip_id.slice(-8)}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Active Trip Guidelines</Text>
          <Text style={styles.instructionText}>
            • Keep your phone's GPS enabled at all times
          </Text>
          <Text style={styles.instructionText}>
            • Don't close the app during the trip
          </Text>
          <Text style={styles.instructionText}>
            • Your location is broadcast every 5 seconds
          </Text>
          <Text style={styles.instructionText}>
            • Stop trip only when route is completed
          </Text>
          <Text style={styles.instructionText}>
            • Drive safely and follow traffic rules
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Stop Trip Button - Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.stopButton} onPress={handleStopTrip}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stopButtonGradient}
          >
            <MaterialCommunityIcons name="stop-circle" size={28} color="#ffffff" />
            <Text style={styles.stopButtonText}>Stop Trip</Text>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
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
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  coordsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  coordLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 12,
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  speedCard: {
    backgroundColor: '#8b5cf6',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  speedLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
  },
  speedDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  speedValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
  },
  speedUnit: {
    fontSize: 20,
    color: '#ffffff',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  instructionsCard: {
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
    lineHeight: 20,
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
  stopButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ActiveTripScreen;