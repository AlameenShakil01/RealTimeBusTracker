// src/screens/public/HomeScreen.js
// FINAL VERSION - Navigates to SearchResultsScreen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Keyboard,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMockRoutes } from '../../services/api';
import locationService from '../../services/LocationService';

const HomeScreen = ({ navigation }) => {
  const [sourceInput, setSourceInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleSearch = async () => {
    if (!sourceInput.trim() && !destinationInput.trim()) {
      Alert.alert('Enter Location', 'Please enter source or destination');
      return;
    }

    try {
      Keyboard.dismiss();
      setSearching(true);

      // TODO: Replace with real API call
      const allRoutes = await getMockRoutes();
      
      const sourceLower = sourceInput.toLowerCase();
      const destLower = destinationInput.toLowerCase();

      const filtered = allRoutes.filter((route) => {
        const matchesSource = !sourceInput || 
          route.start_point.toLowerCase().includes(sourceLower) ||
          route.route_name.toLowerCase().includes(sourceLower);
        
        const matchesDest = !destinationInput || 
          route.end_point.toLowerCase().includes(destLower) ||
          route.route_name.toLowerCase().includes(destLower);
        
        return matchesSource && matchesDest;
      });

      setSearching(false);

      // Navigate to SearchResultsScreen with results
      navigation.navigate('SearchResultsScreen', {
        source: sourceInput || 'Any',
        destination: destinationInput || 'Any',
        results: filtered,
      });

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Unable to search routes');
      setSearching(false);
    }
  };

  const handleNearbyBuses = async () => {
    try {
      setLocationLoading(true);
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        // TODO: Replace with real API call for nearby buses
        const allRoutes = await getMockRoutes();
        const nearbyRoutes = allRoutes.filter(route => route.active_buses > 0);
        
        setLocationLoading(false);
        
        navigation.navigate('SearchResultsScreen', {
          source: 'Your Location',
          destination: 'Nearby',
          results: nearbyRoutes,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to get your location');
      setLocationLoading(false);
    }
  };

  const swapLocations = () => {
    const temp = sourceInput;
    setSourceInput(destinationInput);
    setDestinationInput(temp);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appTitle}>BusTracker</Text>
            <View style={styles.cityBadge}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#8b5cf6" />
              <Text style={styles.cityText}>Your City</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchBox}>
          <Text style={styles.searchTitle}>Where are you going?</Text>
          
          {/* Source Input */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#3b82f6" />
            <TextInput
              style={styles.input}
              placeholder="Enter pickup point..."
              placeholderTextColor="#94a3b8"
              value={sourceInput}
              onChangeText={setSourceInput}
              returnKeyType="next"
            />
            {sourceInput.length > 0 && (
              <TouchableOpacity onPress={() => setSourceInput('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
            <MaterialCommunityIcons name="swap-vertical" size={20} color="#8b5cf6" />
          </TouchableOpacity>

          {/* Destination Input */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="map-marker-check" size={20} color="#8b5cf6" />
            <TextInput
              style={styles.input}
              placeholder="Enter destination..."
              placeholderTextColor="#94a3b8"
              value={destinationInput}
              onChangeText={setDestinationInput}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {destinationInput.length > 0 && (
              <TouchableOpacity onPress={() => setDestinationInput('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity 
            style={styles.searchBtn} 
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="magnify" size={20} color="#ffffff" />
                <Text style={styles.searchBtnText}>Search Routes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <MaterialCommunityIcons name="map-search" size={80} color="#cbd5e1" />
        <Text style={styles.welcomeTitle}>Find Your Bus</Text>
        <Text style={styles.welcomeText}>
          Enter source and destination to search for routes
        </Text>
        <Text style={styles.welcomeOr}>or</Text>
        <TouchableOpacity 
          style={styles.nearbyButton} 
          onPress={handleNearbyBuses}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#8b5cf6" />
          ) : (
            <>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#8b5cf6" />
              <Text style={styles.nearbyText}>Find Nearby Buses</Text>
            </>
          )}
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
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    gap: 12,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  swapBtn: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -8,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  welcomeSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  welcomeOr: {
    fontSize: 14,
    color: '#94a3b8',
    marginVertical: 12,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  nearbyText: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HomeScreen;