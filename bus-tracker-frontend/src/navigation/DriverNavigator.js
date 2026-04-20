// src/navigation/DriverNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DriverDashboard from '../screens/driver/DriverDashboard';
import ActiveTripScreen from '../screens/driver/ActiveTripScreen';
import TripHistoryScreen from '../screens/driver/TripHistoryScreen';

const Stack = createStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
      <Stack.Screen name="ActiveTripScreen" component={ActiveTripScreen} />
      <Stack.Screen name="TripHistoryScreen" component={TripHistoryScreen} />
    </Stack.Navigator>
  );
}