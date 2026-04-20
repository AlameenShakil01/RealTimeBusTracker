// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import FleetManagementScreen from '../screens/admin/FleetManagementScreen';
import RouteManagementScreen from '../screens/admin/RouteManagementScreen';
import DriverManagementScreen from '../screens/admin/DriverManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="FleetManagementScreen" component={FleetManagementScreen} />
      <Stack.Screen name="RouteManagementScreen" component={RouteManagementScreen} />
      <Stack.Screen name="DriverManagementScreen" component={DriverManagementScreen} />
      <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}