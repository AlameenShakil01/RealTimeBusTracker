// src/navigation/RootNavigator.js
import React, { useContext } from 'react';
import PublicNavigator from './PublicNavigator';
import DriverNavigator from './DriverNavigator';
import AdminNavigator from './AdminNavigator';
import { AuthContext } from '../context/AuthContext';

export default function RootNavigator() {
  const { user } = useContext(AuthContext);

  // No user or commuter → Public app
  if (!user || user.role === 'commuter') {
    return <PublicNavigator />;
  }

  // Driver logged in → Driver app
  if (user.role === 'driver') {
    return <DriverNavigator />;
  }

  // Admin logged in → Admin app
  if (user.role === 'admin') {
    return <AdminNavigator />;
  }

  // Fallback
  return <PublicNavigator />;
}