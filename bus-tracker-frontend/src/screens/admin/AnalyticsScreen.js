// src/screens/admin/AnalyticsScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

const AnalyticsScreen = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#8b5cf6',
    backgroundGradientFrom: '#8b5cf6',
    backgroundGradientTo: '#6366f1',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 }
  };

  const tripsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [45, 52, 48, 60, 55, 70, 65] }]
  };

  const routeData = {
    labels: ['101', '202', '303'],
    datasets: [{ data: [120, 95, 80] }]
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="bus-clock" size={32} color="#10b981" />
            <Text style={styles.statValue}>248</Text>
            <Text style={styles.statLabel}>Trips Today</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="timer" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>1.2h</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>

        {/* Trips Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Trips</Text>
          <LineChart
            data={tripsData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Routes Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Most Active Routes</Text>
          <BarChart
            data={routeData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
      </ScrollView>
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
  scrollView: { flex: 1 },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: '#fff', padding: 20,
    borderRadius: 16, alignItems: 'center'
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  chartCard: {
    backgroundColor: '#fff', margin: 16,
    padding: 20, borderRadius: 16
  },
  chartTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
});

export default AnalyticsScreen;