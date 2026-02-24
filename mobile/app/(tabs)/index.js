// ================================================
// DASHBOARD SCREEN - FIXED VERSION
// File: app/(tabs)/index.js
// Fixed import statements
// ================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ✅ FIXED IMPORTS - Pakai named imports
import { getCurrentUser } from '../../services/authService';
import { getTodayAttendance, getMonthlySummary } from '../../services/attendanceService';
import { COLORS, formatTime, formatDate } from '../../constants/config';

const DashboardScreen = () => {
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadData = async () => {
    try {
      // ✅ FIXED - Direct function call
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const today = await getTodayAttendance();
      setTodayAttendance(today);
      
      const summary = await getMonthlySummary();
      setMonthlySummary(summary.data);
      
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  const goToAttendance = () => {
    router.push('/attendance');
  };
  
  const goToHistory = () => {
    router.push('/history');
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };
  
  const renderAttendanceStatus = () => {
    if (!todayAttendance || !todayAttendance.hasCheckedIn) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="alert-circle" size={40} color={COLORS.warning} />
          </View>
          <Text style={styles.statusTitle}>Belum Absen</Text>
          <Text style={styles.statusDescription}>
            Anda belum melakukan check-in hari ini
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={goToAttendance}
          >
            <Text style={styles.actionButtonText}>Check-in Sekarang</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }
    
    const attendance = todayAttendance.data;
    
    if (!todayAttendance.hasCheckedOut) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
          </View>
          <Text style={styles.statusTitle}>Sudah Check-in</Text>
          <Text style={styles.statusDescription}>
            {formatTime(attendance.check_in_time)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {attendance.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={goToAttendance}
          >
            <Text style={styles.actionButtonText}>Check-out</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Ionicons name="checkmark-done-circle" size={40} color={COLORS.success} />
        </View>
        <Text style={styles.statusTitle}>Absensi Lengkap</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Check-in</Text>
            <Text style={styles.timeValue}>{formatTime(attendance.check_in_time)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Check-out</Text>
            <Text style={styles.timeValue}>{formatTime(attendance.check_out_time)}</Text>
          </View>
        </View>
        {attendance.work_duration && (
          <Text style={styles.workDuration}>
            Durasi: {attendance.work_duration.formatted}
          </Text>
        )}
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userPosition}>{user?.position || '-'}</Text>
        </View>
      </View>
      
      <View style={styles.dateCard}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>
      
      {renderAttendanceStatus()}
      
      {monthlySummary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Bulan Ini</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{monthlySummary.total_days}</Text>
              <Text style={styles.summaryLabel}>Total Hari</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {monthlySummary.present}
              </Text>
              <Text style={styles.summaryLabel}>Hadir</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                {monthlySummary.late}
              </Text>
              <Text style={styles.summaryLabel}>Terlambat</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                {monthlySummary.absent}
              </Text>
              <Text style={styles.summaryLabel}>Tidak Hadir</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={goToHistory}
          >
            <Text style={styles.summaryButtonText}>Lihat Riwayat Lengkap</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// Styles sama seperti sebelumnya...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 14, color: COLORS.textLight },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  userPosition: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  dateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  dateText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statusIcon: { marginBottom: 16 },
  statusTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  statusDescription: { fontSize: 16, color: COLORS.textLight, marginBottom: 16 },
  statusBadge: { backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  statusBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  actionButton: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center', gap: 8 },
  actionButtonSecondary: { backgroundColor: COLORS.secondary },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timeItem: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  timeValue: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  timeDivider: { width: 1, height: 40, backgroundColor: COLORS.border, marginHorizontal: 16 },
  workDuration: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  summaryItem: { width: '50%', alignItems: 'center', paddingVertical: 12 },
  summaryValue: { fontSize: 32, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: COLORS.textLight },
  summaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  summaryButtonText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});

export default DashboardScreen;