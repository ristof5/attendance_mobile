// ================================================
// PROFILE SCREEN
// File: app/(tabs)/profile.js
// Screen untuk user profile dan logout
// ================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import services
import authService from '../../services/authService';
import { COLORS, APP_VERSION } from '../../constants/config';
import Button from '../../components/Button';

const ProfileScreen = () => {
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Load user error:', error);
      Alert.alert('Error', 'Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await authService.logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Gagal logout');
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  };
  
  const ProfileItem = ({ icon, label, value }) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value || '-'}</Text>
        </View>
      </View>
    </View>
  );
  
  const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={icon} size={20} color={COLORS.text} />
        </View>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userPosition}>{user?.position || '-'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Profil</Text>
        <View style={styles.card}>
          <ProfileItem icon="card-outline" label="NIP" value={user?.nip} />
          <View style={styles.divider} />
          <ProfileItem icon="mail-outline" label="Email" value={user?.email} />
          <View style={styles.divider} />
          <ProfileItem icon="call-outline" label="Telepon" value={user?.phone} />
          <View style={styles.divider} />
          <ProfileItem icon="briefcase-outline" label="Posisi" value={user?.position} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        <View style={styles.card}>
          <MenuItem
            icon="help-circle-outline"
            label="Bantuan"
            onPress={() => Alert.alert('Bantuan', 'Hubungi admin untuk bantuan')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="information-circle-outline"
            label="Tentang Aplikasi"
            onPress={() => Alert.alert('Tentang', `Version ${APP_VERSION}`)}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={loggingOut}
          variant="outline"
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version {APP_VERSION}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textLight },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  userPosition: { fontSize: 16, color: COLORS.textLight },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 56 },
  profileItem: { padding: 16 },
  profileItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  profileItemContent: { flex: 1 },
  profileItemLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
  profileItemValue: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuItemLabel: { fontSize: 16, color: COLORS.text },
  logoutButton: { borderColor: COLORS.error },
  logoutButtonText: { color: COLORS.error },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 12, color: COLORS.textLight },
});

export default ProfileScreen;