// src/utils/constants.js

export const APP_NAME = 'BusTracker';
export const APP_VERSION = '1.0.0';

// Cities
export const DEFAULT_CITY = 'Your City';

// Map Configuration
export const DEFAULT_MAP_REGION = {
  latitude: 28.6139, // Delhi coordinates as default
  longitude: 77.2090,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Search debounce time
export const SEARCH_DEBOUNCE_MS = 500;

// Refresh intervals
export const BUS_LOCATION_REFRESH_INTERVAL = 5000; // 5 seconds
export const ROUTE_LIST_REFRESH_INTERVAL = 30000; // 30 seconds

// Network
export const NETWORK_TIMEOUT = 10000;
export const MAX_RETRIES = 3;

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_ROLE: '@user_role',
  USER_DATA: '@user_data',
  SELECTED_CITY: '@selected_city',
  RECENT_SEARCHES: '@recent_searches',
  FAVORITE_ROUTES: '@favorite_routes',
};

// User Roles
export const USER_ROLES = {
  COMMUTER: 'commuter',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

// Bus Status
export const BUS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELAYED: 'delayed',
  ON_TIME: 'on_time',
};

// Trip Status
export const TRIP_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Search Types
export const SEARCH_TYPES = {
  ROUTE_NUMBER: 'route_number',
  SOURCE_DESTINATION: 'source_destination',
  NEARBY: 'nearby',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  LOCATION_ERROR: 'Unable to get your location. Please enable GPS.',
  PERMISSION_DENIED: 'Permission denied. Please enable location services.',
  NO_ROUTES_FOUND: 'No routes found matching your search.',
  NO_BUSES_NEARBY: 'No buses nearby at the moment.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRIP_STARTED: 'Trip started successfully',
  TRIP_STOPPED: 'Trip stopped successfully',
  LOCATION_UPDATED: 'Location updated',
};

export default {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CITY,
  DEFAULT_MAP_REGION,
  SEARCH_DEBOUNCE_MS,
  BUS_LOCATION_REFRESH_INTERVAL,
  ROUTE_LIST_REFRESH_INTERVAL,
  NETWORK_TIMEOUT,
  MAX_RETRIES,
  STORAGE_KEYS,
  USER_ROLES,
  BUS_STATUS,
  TRIP_STATUS,
  SEARCH_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};