// src/screens/admin/FleetManagementScreen.js
// Admin: List all buses with status, driver, route - Add Bus functionality

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FleetManagementScreen = ({ navigation }) => {
  const [buses, setBuses] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBus, setNewBus] = useState({
    bus_number: '',
    license_plate: '',
    capacity: '',
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      // TODO: Fetch from API
      const mockBuses = [
        {
          id: '1',
          bus_number: 'DL-1C-AB-1234',
          license_plate: 'DL01AB1234',
          capacity: 40,
          status: 'active',
          driver_name: 'Rajesh Kumar',
          route_number: '101',
          route_name: 'City Center - Airport',
        },
        {
          id: '2',
          bus_number: 'DL-1C-CD-5678',
          license_plate: 'DL01CD5678',
          capacity: 45,
          status: 'active',
          driver_name: 'Suresh Patel',
          route_number: '202',
          route_name: 'Railway Station - Tech Park',
        },
        {
          id: '3',
          bus_number: 'DL-1C-EF-9012',
          license_plate: 'DL01EF9012',
          capacity: 40,
          status: 'inactive',
          driver_name: null,
          route_number: null,
          route_name: 'Not Assigned',
        },
      ];
      setBuses(mockBuses);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    }
  };

  const handleAddBus = async () => {
    if (!newBus.bus_number || !newBus.license_plate || !newBus.capacity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      // TODO: API call to add bus
      Alert.alert('Success', 'Bus added successfully');
      setShowAddModal(false);
      setNewBus({ bus_number: '', license_plate: '', capacity: '' });
      fetchBuses();
    } catch (error) {
      Alert.alert('Error', 'Failed to add bus');
    }
  };

  const filteredBuses = buses.filter(bus => {
    if (filter === 'all') return true;
    return bus.status === filter;
  });

  const renderBusCard = ({ item }) => (
    <TouchableOpacity style={styles.busCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.busInfo}>
          <MaterialCommunityIcons name="bus" size={24} color="#8b5cf6" />
          <View style={styles.busDetails}>
            <Text style={styles.busNumber}>{item.bus_number}</Text>
            <Text style={styles.licensePlate}>{item.license_plate}</Text>
          </View>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? '#dcfce7' : '#fee2e2' }
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.status === 'active' ? '#10b981' : '#ef4444' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? '#065f46' : '#991b1b' }
          ]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.assignmentRow}>
        <View style={styles.assignmentItem}>
          <MaterialCommunityIcons name="account" size={18} color="#64748b" />
          <View style={styles.assignmentContent}>
            <Text style={styles.assignmentLabel}>Driver</Text>
            <Text style={styles.assignmentValue}>
              {item.driver_name || 'Not Assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.assignmentItem}>
          <MaterialCommunityIcons name="routes" size={18} color="#64748b" />
          <View style={styles.assignmentContent}>
            <Text style={styles.assignmentLabel}>Route</Text>
            <Text style={styles.assignmentValue}>
              {item.route_number ? `${item.route_number} - ${item.route_name}` : 'Not Assigned'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.capacityBadge}>
          <MaterialCommunityIcons name="seat-passenger" size={16} color="#64748b" />
          <Text style={styles.capacityText}>{item.capacity} seats</Text>
        </View>
      </View>
    </TouchableOpacity>
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

        <Text style={styles.headerTitle}>Fleet Management</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({buses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active ({buses.filter(b => b.status === 'active').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'inactive' && styles.filterTabActive]}
          onPress={() => setFilter('inactive')}
        >
          <Text style={[styles.filterText, filter === 'inactive' && styles.filterTextActive]}>
            Inactive ({buses.filter(b => b.status === 'inactive').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buses List */}
      <FlatList
        data={filteredBuses}
        renderItem={renderBusCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Bus Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Bus</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bus Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DL-1C-AB-1234"
                  value={newBus.bus_number}
                  onChangeText={(text) => setNewBus({...newBus, bus_number: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>License Plate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DL01AB1234"
                  value={newBus.license_plate}
                  onChangeText={(text) => setNewBus({...newBus, license_plate: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Capacity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  keyboardType="numeric"
                  value={newBus.capacity}
                  onChangeText={(text) => setNewBus({...newBus, capacity: text})}
                />
              </View>

              <TouchableOpacity style={styles.addBusButton} onPress={handleAddBus}>
                <Text style={styles.addBusButtonText}>Add Bus</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  busCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busDetails: {
    gap: 4,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  licensePlate: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  assignmentRow: {
    gap: 12,
    marginBottom: 12,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  assignmentContent: {
    flex: 1,
  },
  assignmentLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  assignmentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addBusButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addBusButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FleetManagementScreen;