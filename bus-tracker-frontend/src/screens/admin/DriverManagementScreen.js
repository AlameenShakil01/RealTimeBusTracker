// src/screens/admin/DriverManagementScreen.js
// Admin: List drivers, add driver, assign bus

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

const DriverManagementScreen = ({ navigation }) => {
  const [drivers, setDrivers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      // TODO: Fetch from API
      const mockDrivers = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          phone: '9876543210',
          email: 'rajesh@example.com',
          status: 'active',
          assigned_bus: 'DL-1C-AB-1234',
          route_number: '101',
          total_trips: 245,
        },
        {
          id: '2',
          name: 'Suresh Patel',
          phone: '9876543211',
          email: 'suresh@example.com',
          status: 'active',
          assigned_bus: 'DL-1C-CD-5678',
          route_number: '202',
          total_trips: 189,
        },
        {
          id: '3',
          name: 'Amit Singh',
          phone: '9876543212',
          email: 'amit@example.com',
          status: 'inactive',
          assigned_bus: null,
          route_number: null,
          total_trips: 67,
        },
      ];
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      // TODO: API call to add driver
      Alert.alert('Success', 'Driver added successfully');
      setShowAddModal(false);
      setNewDriver({ name: '', phone: '', email: '', password: '' });
      fetchDrivers();
    } catch (error) {
      Alert.alert('Error', 'Failed to add driver');
    }
  };

  const handleAssignBus = (driver) => {
    setSelectedDriver(driver);
    setShowAssignModal(true);
  };

  const handleDeleteDriver = (driver) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driver.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call to delete driver
              Alert.alert('Success', 'Driver deleted successfully');
              fetchDrivers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete driver');
            }
          },
        },
      ]
    );
  };

  const renderDriverCard = ({ item }) => (
    <View style={styles.driverCard}>
      <View style={styles.cardHeader}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={28} color="#8b5cf6" />
          </View>
          
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{item.name}</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone" size={14} color="#64748b" />
              <Text style={styles.contactText}>{item.phone}</Text>
            </View>
            {item.email && (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email" size={14} color="#64748b" />
                <Text style={styles.contactText}>{item.email}</Text>
              </View>
            )}
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

      <View style={styles.assignmentSection}>
        <View style={styles.assignmentItem}>
          <MaterialCommunityIcons name="bus" size={20} color="#64748b" />
          <View style={styles.assignmentContent}>
            <Text style={styles.assignmentLabel}>Assigned Bus</Text>
            <Text style={styles.assignmentValue}>
              {item.assigned_bus || 'Not Assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.assignmentItem}>
          <MaterialCommunityIcons name="routes" size={20} color="#64748b" />
          <View style={styles.assignmentContent}>
            <Text style={styles.assignmentLabel}>Route</Text>
            <Text style={styles.assignmentValue}>
              {item.route_number || 'Not Assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.assignmentItem}>
          <MaterialCommunityIcons name="history" size={20} color="#64748b" />
          <View style={styles.assignmentContent}>
            <Text style={styles.assignmentLabel}>Total Trips</Text>
            <Text style={styles.assignmentValue}>{item.total_trips}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAssignBus(item)}
        >
          <MaterialCommunityIcons name="bus-multiple" size={18} color="#8b5cf6" />
          <Text style={styles.actionButtonText}>Assign Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteDriver(item)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-off" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Drivers Found</Text>
      <Text style={styles.emptyText}>Add your first driver to get started</Text>
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

        <Text style={styles.headerTitle}>Driver Management</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{drivers.length}</Text>
          <Text style={styles.statLabel}>Total Drivers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {drivers.filter(d => d.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {drivers.filter(d => !d.assigned_bus).length}
          </Text>
          <Text style={styles.statLabel}>Unassigned</Text>
        </View>
      </View>

      {/* Drivers List */}
      <FlatList
        data={drivers}
        renderItem={renderDriverCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      {/* Add Driver Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Driver</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rajesh Kumar"
                  value={newDriver.name}
                  onChangeText={(text) => setNewDriver({...newDriver, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={newDriver.phone}
                  onChangeText={(text) => setNewDriver({...newDriver, phone: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="driver@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newDriver.email}
                  onChangeText={(text) => setNewDriver({...newDriver, email: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  secureTextEntry
                  value={newDriver.password}
                  onChangeText={(text) => setNewDriver({...newDriver, password: text})}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddDriver}>
                <Text style={styles.submitButtonText}>Add Driver</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assign Bus Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Bus</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.assignInfo}>
              <Text style={styles.assignLabel}>Driver:</Text>
              <Text style={styles.assignValue}>{selectedDriver?.name}</Text>
            </View>

            <Text style={styles.busListTitle}>Available Buses</Text>

            {/* Mock bus list - TODO: Fetch from API */}
            {['DL-1C-AB-1234', 'DL-1C-CD-5678', 'DL-1C-EF-9012'].map((bus) => (
              <TouchableOpacity
                key={bus}
                style={styles.busOption}
                onPress={() => {
                  Alert.alert('Success', `Assigned ${bus} to ${selectedDriver?.name}`);
                  setShowAssignModal(false);
                }}
              >
                <MaterialCommunityIcons name="bus" size={24} color="#8b5cf6" />
                <Text style={styles.busOptionText}>{bus}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  driverCard: {
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
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
  assignmentSection: {
    gap: 10,
    marginBottom: 12,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontWeight: '700',
    color: '#1f2937',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
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
    maxHeight: '85%',
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
  submitButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  assignInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  assignLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  assignValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  busListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  busOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  busOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default DriverManagementScreen;