// src/screens/admin/AdminDashboard.js
// UPDATED - Admin Dashboard with working navigation to all screens

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalRoutes: 5,
    totalBuses: 12,
    activeBuses: 8,
    totalDrivers: 15,
    activeTrips: 8,
    completedToday: 24,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh stats from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => navigation.replace('HomeScreen'),
        },
      ]
    );
  };

  const MenuCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8b5cf6" />

      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Fleet Management System</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }
      >
        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="routes"
            value={stats.totalRoutes}
            label="Total Routes"
            color="#3b82f6"
          />
          <StatCard
            icon="bus-multiple"
            value={stats.totalBuses}
            label="Total Buses"
            color="#8b5cf6"
          />
          <StatCard
            icon="bus-clock"
            value={stats.activeBuses}
            label="Active Buses"
            color="#10b981"
          />
          <StatCard
            icon="account-group"
            value={stats.totalDrivers}
            label="Total Drivers"
            color="#f59e0b"
          />
        </View>

        {/* Today's Activity */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <MaterialCommunityIcons name="calendar-today" size={24} color="#8b5cf6" />
            <Text style={styles.activityTitle}>Today's Activity</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{stats.activeTrips}</Text>
              <Text style={styles.activityLabel}>Active Trips</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{stats.completedToday}</Text>
              <Text style={styles.activityLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Management Menu */}
        <Text style={styles.sectionTitle}>Management</Text>

        <MenuCard
          icon="routes"
          title="Route Management"
          subtitle="Add, edit, and delete routes"
          color="#3b82f6"
          onPress={() => navigation.navigate('RouteManagementScreen')}
        />

        <MenuCard
          icon="bus"
          title="Bus Management"
          subtitle="Manage fleet and assignments"
          color="#8b5cf6"
          onPress={() => navigation.navigate('FleetManagementScreen')}
        />

        <MenuCard
          icon="account-tie"
          title="Driver Management"
          subtitle="Manage driver accounts"
          color="#f59e0b"
          onPress={() => navigation.navigate('DriverManagementScreen')}
        />

        <MenuCard
          icon="map-marker-path"
          title="Live Tracking"
          subtitle="Track all active buses"
          color="#10b981"
          onPress={() => Alert.alert('Coming Soon', 'Live tracking map for all buses will be available soon')}
        />

        <MenuCard
          icon="chart-line"
          title="Analytics"
          subtitle="View reports and statistics"
          color="#ec4899"
          onPress={() => navigation.navigate('AnalyticsScreen')}
        />

        <MenuCard
          icon="cog"
          title="System Settings"
          subtitle="Configure system parameters"
          color="#64748b"
          onPress={() => Alert.alert('Coming Soon', 'System settings will be available soon')}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  activityDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e2e8f0',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
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
        elevation: 2,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default AdminDashboard;