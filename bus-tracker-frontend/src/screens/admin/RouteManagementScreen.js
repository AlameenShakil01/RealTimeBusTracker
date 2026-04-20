// src/screens/admin/RouteManagementScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, StatusBar, Modal, TextInput, Alert, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RouteManagementScreen = ({ navigation }) => {
  const [routes, setRoutes] = useState([
    {
      id: '1', route_number: '101', route_name: 'City Center - Airport',
      start_point: 'Central Station', end_point: 'Airport',
      total_stops: 15, distance: 25, expanded: false,
      stops: ['Central Station', 'City Mall', 'Hospital', 'Tech Park', 'Airport']
    },
    {
      id: '2', route_number: '202', route_name: 'Railway - Tech Park',
      start_point: 'Railway Station', end_point: 'Tech Park Phase 2',
      total_stops: 12, distance: 18, expanded: false,
      stops: ['Railway Station', 'Market', 'University', 'Tech Park']
    },
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleExpand = (id) => {
    setRoutes(routes.map(r => 
      r.id === id ? {...r, expanded: !r.expanded} : r
    ));
  };

  const renderRoute = ({ item }) => (
    <View style={styles.routeCard}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.routeHeader}>
          <View style={styles.routeBadge}>
            <Text style={styles.routeNumber}>{item.route_number}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.routeName}>{item.route_name}</Text>
            <Text style={styles.routeInfo}>{item.total_stops} stops • {item.distance} km</Text>
          </View>
          <MaterialCommunityIcons 
            name={item.expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} color="#64748b" 
          />
        </View>
      </TouchableOpacity>

      {item.expanded && (
        <View style={styles.stopsContainer}>
          <Text style={styles.stopsTitle}>Stops:</Text>
          {item.stops.map((stop, idx) => (
            <Text key={idx} style={styles.stopText}>• {stop}</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Management</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={24} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0'
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  listContent: { padding: 16 },
  routeCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0'
  },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeBadge: {
    backgroundColor: '#8b5cf6', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8
  },
  routeNumber: { color: '#fff', fontSize: 14, fontWeight: '700' },
  routeName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  routeInfo: { fontSize: 13, color: '#64748b' },
  stopsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  stopsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  stopText: { fontSize: 13, color: '#64748b', marginBottom: 4 },
});

export default RouteManagementScreen;