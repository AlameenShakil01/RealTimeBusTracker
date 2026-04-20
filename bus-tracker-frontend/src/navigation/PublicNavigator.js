// src/navigation/PublicNavigator.js
// COMPLETE PUBLIC NAVIGATOR - All Screens Included

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Public Screens
import SplashScreen from '../screens/public/SplashScreen';
import HomeScreen from '../screens/public/HomeScreen';
import SettingsScreen from '../screens/public/SettingsScreen';
import SearchResultsScreen from '../screens/public/SearchResultsScreen';
import RouteDetailsScreen from '../screens/public/RouteDetailsScreen';
import LiveTrackingScreen from '../screens/public/LiveTrackingScreen';

// Auth Screen
import PartnerLoginScreen from '../screens/auth/PartnerLoginScreen';

// Driver Screens
import DriverDashboard from '../screens/driver/DriverDashboard';
import ActiveTripScreen from '../screens/driver/ActiveTripScreen';
import TripHistoryScreen from '../screens/driver/TripHistoryScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import FleetManagementScreen from '../screens/admin/FleetManagementScreen';
import RouteManagementScreen from '../screens/admin/RouteManagementScreen';
import DriverManagementScreen from '../screens/admin/DriverManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

const Stack = createStackNavigator();

const PublicNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="SplashScreen"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
      }}
    >
      {/* ===== PUBLIC FLOW ===== */}
      <Stack.Screen 
        name="SplashScreen" 
        component={SplashScreen}
        options={{ animationEnabled: false }}
      />
      
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ gestureEnabled: false }}
      />
      
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen}
      />

      <Stack.Screen 
        name="SearchResultsScreen" 
        component={SearchResultsScreen}
      />

      <Stack.Screen 
        name="RouteDetailsScreen" 
        component={RouteDetailsScreen}
      />

      <Stack.Screen 
        name="LiveTrackingScreen" 
        component={LiveTrackingScreen}
      />

      {/* ===== AUTH ===== */}
      <Stack.Screen 
        name="PartnerLoginScreen" 
        component={PartnerLoginScreen}
      />

      {/* ===== DRIVER SCREENS ===== */}
      <Stack.Screen 
        name="DriverDashboard" 
        component={DriverDashboard}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen 
        name="ActiveTripScreen" 
        component={ActiveTripScreen}
      />

      <Stack.Screen 
        name="TripHistoryScreen" 
        component={TripHistoryScreen}
      />

      {/* ===== ADMIN SCREENS ===== */}
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen 
        name="FleetManagementScreen" 
        component={FleetManagementScreen}
      />

      <Stack.Screen 
        name="RouteManagementScreen" 
        component={RouteManagementScreen}
      />

      <Stack.Screen 
        name="DriverManagementScreen" 
        component={DriverManagementScreen}
      />

      <Stack.Screen 
        name="AnalyticsScreen" 
        component={AnalyticsScreen}
      />
    </Stack.Navigator>
  );
};

export default PublicNavigator;