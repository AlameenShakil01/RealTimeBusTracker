// src/screens/public/SearchResultsScreen.js
// Shows list of routes matching source/destination search

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchResultsScreen = ({ route, navigation }) => {
  const { source, destination, results } = route.params;

  const handleRoutePress = (routeData) => {
    navigation.navigate('RouteDetailsScreen', { route: routeData });
  };

  const renderRouteCard = ({ item }) => (
    <TouchableOpacity
      style={styles.routeCard}
      onPress={() => handleRoutePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeBadge}>
          <Text style={styles.routeNumber}>{item.route_number}</Text>
        </View>

        <View style={styles.busStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.active_buses > 0 ? '#10b981' : '#ef4444' },
            ]}
          />
          <Text style={styles.busCount}>
            {item.active_buses} Bus{item.active_buses !== 1 ? 'es' : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.routeName}>{item.route_name}</Text>

      <View style={styles.locations}>
        <View style={styles.locationItem}>
          <MaterialCommunityIcons name="circle" size={10} color="#3b82f6" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.start_point}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationItem}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#8b5cf6" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.end_point}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerInfo}>{item.total_stops} stops</Text>
        <Text style={styles.footerInfo}>•</Text>
        <Text style={styles.footerInfo}>{item.distance} km</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#94a3b8"
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="bus-alert" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Routes Found</Text>
      <Text style={styles.emptyText}>
        No routes match your search criteria. Try different locations.
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

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search Results</Text>
          <Text style={styles.headerSubtitle}>
            {source} → {destination}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.countText}>
          {results.length} route{results.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  resultsCount: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  routeNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  busStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  busCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  routeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  locations: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  divider: {
    height: 20,
    width: 2,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerInfo: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 'auto',
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

export default SearchResultsScreen;