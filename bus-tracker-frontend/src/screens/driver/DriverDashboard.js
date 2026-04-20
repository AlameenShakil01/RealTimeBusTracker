// src/screens/driver/DriverDashboard.js
// Driver Dashboard - Start/Stop Trips, GPS Tracking

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
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import locationService from '../../services/LocationService';

const DriverDashboard = ({ navigation }) => {
  const [driverInfo] = useState({
    name: 'Rajesh Kumar',
    phone: '9876543210',
    busNumber: 'DL-1C-AB-1234',
    routeNumber: '101',
    routeName: 'City Center - Airport',
  });

  const [tripActive, setTripActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get driver's current location
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let interval;
    if (tripActive) {
      // Send GPS updates every 5 seconds when trip is active
      interval = setInterval(() => {
        sendLocationUpdate();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tripActive]);

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const sendLocationUpdate = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        
        // TODO: Send to backend via WebSocket
        // socket.emit('location-update', {
        //   trip_id: currentTripId,
        //   latitude: location.latitude,
        //   longitude: location.longitude,
        //   speed: location.speed,
        //   timestamp: Date.now()
        // });
        
        console.log('Location updated:', location);
      }
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const handleStartTrip = async () => {
    try {
      setLoading(true);

      // Check GPS permission
      const location = await locationService.getCurrentLocation();
      if (!location) {
        Alert.alert('GPS Required', 'Please enable location services to start trip');
        setLoading(false);
        return;
      }

      // TODO: API call to start trip
      // const response = await startTrip(busId, routeId);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTripActive(true);
      setTripStartTime(new Date());
      setCurrentLocation(location);

      Alert.alert('Trip Started', 'Your trip has started. Drive safely!');
    } catch (error) {
      console.error('Start trip error:', error);
      Alert.alert('Error', 'Unable to start trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            try {
              setLoading(true);

              // TODO: API call to stop trip
              // await stopTrip(currentTripId);

              await new Promise(resolve => setTimeout(resolve, 1000));

              setTripActive(false);
              setTripStartTime(null);

              Alert.alert('Trip Stopped', 'Trip has been completed successfully');
            } catch (error) {
              console.error('Stop trip error:', error);
              Alert.alert('Error', 'Unable to stop trip');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => navigation.replace('HomeScreen'),
        },
      ]
    );
  };

  const getTripDuration = () => {
    if (!tripStartTime) return '00:00:00';

    const now = new Date();
    const diff = now - tripStartTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />

      {/* Header */}
      <LinearGradient
        colors={tripActive ? ['#10b981', '#059669'] : ['#64748b', '#475569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Driver Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {tripActive ? '🟢 Trip Active' : '🔴 No Active Trip'}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Driver Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-circle" size={24} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Driver Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{driverInfo.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{driverInfo.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bus Number:</Text>
            <Text style={styles.infoValue}>{driverInfo.busNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Route:</Text>
            <Text style={styles.infoValue}>
              {driverInfo.routeNumber} - {driverInfo.routeName}
            </Text>
          </View>
        </View>

        {/* Trip Status Card */}
        {tripActive && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="timer" size={24} color="#10b981" />
              <Text style={styles.cardTitle}>Trip Status</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Duration</Text>
                <Text style={styles.statusValue}>{getTripDuration()}</Text>
              </View>

              <View style={styles.statusDivider} />

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Location</Text>
                <Text style={styles.statusValue}>
                  {currentLocation ? '📍 Active' : '❌ No GPS'}
                </Text>
              </View>
            </View>

            {currentLocation && (
              <View style={styles.coordinates}>
                <Text style={styles.coordText}>
                  Lat: {currentLocation.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordText}>
                  Lng: {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Trip Control */}
        <View style={styles.controlCard}>
          {!tripActive ? (
            <>
              <MaterialCommunityIcons name="bus" size={64} color="#10b981" />
              <Text style={styles.controlTitle}>Ready to Start</Text>
              <Text style={styles.controlSubtitle}>
                Make sure GPS is enabled before starting your trip
              </Text>

              <TouchableOpacity
                style={[styles.startButton, loading && styles.buttonDisabled]}
                onPress={handleStartTrip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="play-circle" size={24} color="#ffffff" />
                    <Text style={styles.startButtonText}>Start Trip</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="bus-clock" size={64} color="#ef4444" />
              <Text style={styles.controlTitle}>Trip in Progress</Text>
              <Text style={styles.controlSubtitle}>
                Your location is being tracked. Drive safely!
              </Text>

              <TouchableOpacity
                style={[styles.stopButton, loading && styles.buttonDisabled]}
                onPress={handleStopTrip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="stop-circle" size={24} color="#ffffff" />
                    <Text style={styles.stopButtonText}>Stop Trip</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instructions</Text>
          <Text style={styles.instructionText}>
            • Keep GPS enabled during the trip
          </Text>
          <Text style={styles.instructionText}>
            • Don't close the app while driving
          </Text>
          <Text style={styles.instructionText}>
            • Stop trip only when route is completed
          </Text>
          <Text style={styles.instructionText}>
            • Your location updates every 5 seconds
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  coordinates: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  coordText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  controlCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  controlTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  controlSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  instructions: {
    margin: 16,
    padding: 20,
    backgroundColor: '#eff6ff',
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
    height: 24,
  },
});

export default DriverDashboard;