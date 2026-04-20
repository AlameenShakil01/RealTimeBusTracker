// src/screens/public/SettingsScreen.js
// Settings with Hidden Partner Login

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
  const newCount = tapCount + 1;
  setTapCount(newCount);
 
  if (newCount === 5) {
    setTapCount(0);
    navigation.navigate('PartnerLoginScreen');
  }
};

  const handleAbout = () => {
    Alert.alert(
      'About BusTracker',
      'Version 1.0.0\n\nReal-time bus tracking application for public transport.\n\n© 2024 BusTracker',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us.\n\nWe only collect location data when you use the "Nearby Buses" feature.\n\nYour search history is not stored.',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using BusTracker, you agree to our terms of service.\n\nThis is a public service application for tracking buses in real-time.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Help & Support',
      'Need help?\n\nEmail: support@bustracker.com\nPhone: +91 9876543210\n\nWe are here to help!',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'We would love to hear from you!\n\nEmail your feedback to:\nfeedback@bustracker.com',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#8b5cf6" />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>

      {rightComponent || (
        showArrow && (
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        )
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
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
        
        <Text style={styles.headerTitle}>Settings</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo - HIDDEN PARTNER LOGIN (Tap 5 times) */}
        <TouchableOpacity 
          style={styles.logoSection}
          onPress={handleLogoTap}
          activeOpacity={1}
        >
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="bus" size={40} color="#8b5cf6" />
          </View>
          <Text style={styles.appName}>BusTracker</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </TouchableOpacity>

        {/* Preferences Section */}
        <SectionHeader title="PREFERENCES" />
        
        <View style={styles.section}>
          <SettingItem
            icon="bell-outline"
            title="Notifications"
            subtitle="Get alerts for bus arrivals"
            onPress={() => {}}
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#cbd5e1', true: '#c4b5fd' }}
                thumbColor={notificationsEnabled ? '#8b5cf6' : '#f1f5f9'}
              />
            }
          />

          <View style={styles.divider} />

          <SettingItem
            icon="theme-light-dark"
            title="Dark Mode"
            subtitle="Coming soon"
            onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available in next update')}
            showArrow={false}
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={() => Alert.alert('Coming Soon', 'Dark mode will be available soon')}
                trackColor={{ false: '#cbd5e1', true: '#c4b5fd' }}
                thumbColor={darkModeEnabled ? '#8b5cf6' : '#f1f5f9'}
                disabled={true}
              />
            }
          />

          <View style={styles.divider} />

          <SettingItem
            icon="map-marker-outline"
            title="Location Services"
            subtitle="Always allow for best experience"
            onPress={() => Alert.alert('Location', 'Location is used only when you search for nearby buses')}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="ABOUT" />
        
        <View style={styles.section}>
          <SettingItem
            icon="information-outline"
            title="About App"
            subtitle="Learn more about BusTracker"
            onPress={handleAbout}
          />

          <View style={styles.divider} />

          <SettingItem
            icon="shield-check-outline"
            title="Privacy Policy"
            onPress={handlePrivacy}
          />

          <View style={styles.divider} />

          <SettingItem
            icon="file-document-outline"
            title="Terms of Service"
            onPress={handleTerms}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="SUPPORT" />
        
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={handleSupport}
          />

          <View style={styles.divider} />

          <SettingItem
            icon="message-text-outline"
            title="Send Feedback"
            subtitle="Help us improve"
            onPress={handleFeedback}
          />

          <View style={styles.divider} />

          <SettingItem
            icon="star-outline"
            title="Rate Us"
            subtitle="Rate us on App Store"
            onPress={() => Alert.alert('Thank You!', 'Rating feature coming soon')}
          />
        </View>

        {/* Hidden Hint */}
        <Text style={styles.hiddenHint}>
          💡 Tip: Drivers & Admins, tap the logo above 5 times
        </Text>

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
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
  },
  hiddenHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    paddingVertical: 24,
    paddingHorizontal: 32,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;