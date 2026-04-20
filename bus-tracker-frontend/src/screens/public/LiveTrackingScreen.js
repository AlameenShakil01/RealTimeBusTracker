// src/screens/public/LiveTrackingScreen.js
// THE MOST IMPORTANT SCREEN - Map with moving bus marker, bottom panel with ETA

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LiveTrackingScreen = ({ route, navigation }) => {
  const { bus_id, route_id, route_number } = route.params;
  
  const mapRef = useRef(null);
  const [busLocation, setBusLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
  });
  const [busData, setBusData] = useState({
    speed: 45,
    nextStop: 'City Mall',
    distanceToStop: 2.3,
    eta: 5,
  });

  // Mock route polyline - TODO: Fetch from API
  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.2090 },
    { latitude: 28.6200, longitude: 77.2150 },
    { latitude: 28.6280, longitude: 77.2200 },
    { latitude: 28.6350, longitude: 77.2280 },
  ];

  useEffect(() => {
    // TODO: Connect to WebSocket for real-time updates
    // const socket = io('YOUR_BACKEND_URL');
    // socket.emit('subscribe-bus', { bus_id });
    // socket.on('bus-location', (data) => {
    //   setBusLocation({ latitude: data.latitude, longitude: data.longitude });
    //   setBusData({ ...data });
    // });
    
    // Mock real-time updates for demo
    const interval = setInterval(() => {
      setBusLocation(prev => ({
        latitude: prev.latitude + 0.0001,
        longitude: prev.longitude + 0.0001,
      }));
      setBusData(prev => ({
        ...prev,
        distanceToStop: Math.max(0.1, prev.distanceToStop - 0.1),
        eta: Math.max(1, prev.eta - 0.5),
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      // socket.disconnect();
    };
  }, [bus_id]);

  useEffect(() => {
    // Center map on bus location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [busLocation]);

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: busLocation.latitude,
          longitude: busLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Route Line */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#8b5cf6"
          strokeWidth={4}
        />

        {/* Bus Marker */}
        <Marker
          coordinate={busLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={0}
        >
          <View style={styles.busMarker}>
            <MaterialCommunityIcons name="bus" size={24} color="#ffffff" />
          </View>
        </Marker>
      </MapView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
      </TouchableOpacity>

      {/* Route Badge */}
      <View style={styles.routeBadge}>
        <Text style={styles.routeText}>Route {route_number}</Text>
      </View>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#8b5cf6" />
      </TouchableOpacity>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHeader}>
          <View style={styles.busInfo}>
            <View style={styles.busIconContainer}>
              <MaterialCommunityIcons name="bus" size={24} color="#8b5cf6" />
            </View>
            <View>
              <Text style={styles.busLabel}>Bus {bus_id.slice(-3)}</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live Tracking</Text>
              </View>
            </View>
          </View>

          <View style={styles.speedContainer}>
            <Text style={styles.speedValue}>{busData.speed}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Next Stop</Text>
              <Text style={styles.statValue}>{busData.nextStop}</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color="#64748b" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{busData.distanceToStop.toFixed(1)} km</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#64748b" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>{Math.ceil(busData.eta)} min</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  routeBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    alignSelf: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  routeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  recenterButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  busMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  speedUnit: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
});

export default LiveTrackingScreen;