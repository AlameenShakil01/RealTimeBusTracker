// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'Something went wrong');
    } else if (error.request) {
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

export const getRoutes = async () => {
  try {
    const response = await api.get('/routes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchRoutes = async (source, destination) => {
  try {
    const response = await api.get('/routes/search', {
      params: { source, destination },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRouteDetails = async (routeId) => {
  try {
    const response = await api.get(`/routes/${routeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBuses = async () => {
  try {
    const response = await api.get('/buses');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBusLocation = async (busId) => {
  try {
    const response = await api.get(`/buses/${busId}/location`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getActiveBuses = async () => {
  try {
    const response = await api.get('/trips/active');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNearbyBuses = async (latitude, longitude, radius = 5000) => {
  try {
    const response = await api.get('/buses/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mock data for development/testing
export const getMockRoutes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          route_number: '101',
          route_name: 'City Center - Airport',
          start_point: 'Central Station',
          end_point: 'International Airport',
          active_buses: 3,
          total_stops: 15,
          distance: 25,
        },
        {
          id: 2,
          route_number: '202',
          route_name: 'Railway Station - Tech Park',
          start_point: 'Main Railway Station',
          end_point: 'Tech Park Phase 2',
          active_buses: 2,
          total_stops: 12,
          distance: 18,
        },
        {
          id: 3,
          route_number: '303',
          route_name: 'Hospital - University',
          start_point: 'City Hospital',
          end_point: 'State University',
          active_buses: 1,
          total_stops: 10,
          distance: 12,
        },
        {
          id: 4,
          route_number: '404',
          route_name: 'Mall - Beach Road',
          start_point: 'Grand Mall',
          end_point: 'Beach Road Terminal',
          active_buses: 0,
          total_stops: 8,
          distance: 15,
        },
        {
          id: 5,
          route_number: '505',
          route_name: 'Old City - New Town',
          start_point: 'Old City Gate',
          end_point: 'New Town Square',
          active_buses: 4,
          total_stops: 20,
          distance: 30,
        },
      ]);
    }, 1000);
  });
};

export default api;