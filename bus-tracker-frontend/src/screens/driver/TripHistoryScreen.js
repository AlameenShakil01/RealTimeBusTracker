// src/screens/driver/TripHistoryScreen.js
// Simple list of past trips - date, route, start/end time, duration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TripHistoryScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      // TODO: Fetch from API
      // const response = await getTripHistory();
      // setTrips(response.data);

      // Mock data
      const mockTrips = [
        {
          id: '1',
          route_number: '101',
          route_name: 'City Center - Airport',
          date: '2024-03-18',
          start_time: '08:30 AM',
          end_time: '10:15 AM',
          duration: '1h 45m',
          distance: 25.5,
        },
        {
          id: '2',
          route_number: '101',
          route_name: 'City Center - Airport',
          date: '2024-03-17',
          start_time: '02:00 PM',
          end_time: '03:40 PM',
          duration: '1h 40m',
          distance: 25.5,
        },
        {
          id: '3',
          route_number: '202',
          route_name: 'Railway Station - Tech Park',
          date: '2024-03-17',
          start_time: '09:15 AM',
          end_time: '10:30 AM',
          duration: '1h 15m',
          distance: 18.0,
        },
        {
          id: '4',
          route_number: '101',
          route_name: 'City Center - Airport',
          date: '2024-03-16',
          start_time: '03:45 PM',
          end_time: '05:20 PM',
          duration: '1h 35m',
          distance: 25.5,
        },
      ];

      setTrips(mockTrips);
    } catch (error) {
      console.error('Failed to fetch trip history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTripHistory();
    setRefreshing(false);
  };

  const renderTripCard = ({ item }) => (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.routeBadge}>
          <Text style={styles.routeNumber}>{item.route_number}</Text>
        </View>
        
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <Text style={styles.routeName}>{item.route_name}</Text>

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <MaterialCommunityIcons name="clock-start" size={16} color="#64748b" />
          <Text style={styles.timeLabel}>Start:</Text>
          <Text style={styles.timeValue}>{item.start_time}</Text>
        </View>

        <MaterialCommunityIcons name="arrow-right" size={16} color="#cbd5e1" />

        <View style={styles.timeItem}>
          <MaterialCommunityIcons name="clock-end" size={16} color="#64748b" />
          <Text style={styles.timeLabel}>End:</Text>
          <Text style={styles.timeValue}>{item.end_time}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="timer" size={16} color="#8b5cf6" />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialCommunityIcons name="road-variant" size={16} color="#3b82f6" />
          <Text style={styles.statText}>{item.distance} km</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
          <Text style={styles.statText}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="history" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Trip History</Text>
      <Text style={styles.emptyText}>
        Your completed trips will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trip History</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{trips.length}</Text>
          <Text style={styles.summaryLabel}>Total Trips</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {trips.reduce((sum, trip) => {
              const hours = parseFloat(trip.duration);
              return sum + (isNaN(hours) ? 0 : hours);
            }, 0).toFixed(0)}h
          </Text>
          <Text style={styles.summaryLabel}>Total Hours</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {trips.reduce((sum, trip) => sum + trip.distance, 0).toFixed(0)} km
          </Text>
          <Text style={styles.summaryLabel}>Total Distance</Text>
        </View>
      </View>

      {/* Trips List */}
      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
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
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  routeNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TripHistoryScreen;