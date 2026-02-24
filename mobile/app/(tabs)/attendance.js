// ================================================
// ATTENDANCE SCREEN
// File: app/(tabs)/attendance.js
// Screen untuk check-in dan check-out dengan geolocation
// ================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services
import attendanceService from '../../services/attendanceService';
import locationService from '../../services/locationService';
import { COLORS, formatTime } from '../../constants/config';
import Button from '../../components/Button';

// PENJELASAN FLOW:
// 1. Load today's attendance status
// 2. Check location permission
// 3. Kalau belum check-in, tampilkan tombol check-in
// 4. Kalau sudah check-in tapi belum check-out, tampilkan tombol check-out
// 5. Kalau sudah check-out, tampilkan info lengkap

const AttendanceScreen = () => {
  
  // State
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  
  // ================================================
  // LOAD DATA
  // ================================================
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get today's attendance
      const today = await attendanceService.getTodayAttendance();
      setTodayAttendance(today);
      
      // Get office locations
      const locations = await attendanceService.getOfficeLocations();
      if (locations.success && locations.locations.length > 0) {
        setOfficeLocation(locations.locations[0]); // Ambil location pertama
      }
      
      // Get current location (optional - untuk tampilkan jarak)
      try {
        const loc = await locationService.getCurrentLocation();
        if (loc.success) {
          setCurrentLocation(loc);
          
          // Calculate distance jika ada office location
          if (locations.locations[0]) {
            const dist = locationService.calculateDistance(
              loc.latitude,
              loc.longitude,
              locations.locations[0].latitude,
              locations.locations[0].longitude
            );
            setDistance(dist);
          }
        }
      } catch (error) {
        console.log('Location not available yet');
      }
      
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  // ================================================
  // HANDLE CHECK-IN
  // ================================================
  const handleCheckIn = async () => {
    try {
      setProcessing(true);
      
      // Confirm
      Alert.alert(
        'Konfirmasi Check-in',
        'Anda yakin ingin melakukan check-in?',
        [
          { 
            text: 'Batal', 
            style: 'cancel',
            onPress: () => setProcessing(false)
          },
          {
            text: 'Ya, Check-in',
            onPress: async () => {
              try {
                const result = await attendanceService.checkIn(
                  officeLocation?.id,
                  'Check-in dari mobile app'
                );
                
                // Success
                Alert.alert(
                  'Berhasil!',
                  result.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => loadData() // Reload data
                    }
                  ]
                );
                
              } catch (error) {
                console.error('Check-in error:', error);
                Alert.alert(
                  'Check-in Gagal',
                  error.message || 'Terjadi kesalahan saat check-in'
                );
              } finally {
                setProcessing(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      setProcessing(false);
    }
  };
  
  // ================================================
  // HANDLE CHECK-OUT
  // ================================================
  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      
      // Confirm
      Alert.alert(
        'Konfirmasi Check-out',
        'Anda yakin ingin melakukan check-out?',
        [
          { 
            text: 'Batal', 
            style: 'cancel',
            onPress: () => setProcessing(false)
          },
          {
            text: 'Ya, Check-out',
            onPress: async () => {
              try {
                const result = await attendanceService.checkOut(
                  'Check-out dari mobile app'
                );
                
                // Success
                Alert.alert(
                  'Berhasil!',
                  result.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => loadData() // Reload data
                    }
                  ]
                );
                
              } catch (error) {
                console.error('Check-out error:', error);
                Alert.alert(
                  'Check-out Gagal',
                  error.message || 'Terjadi kesalahan saat check-out'
                );
              } finally {
                setProcessing(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      setProcessing(false);
    }
  };
  
  // ================================================
  // REFRESH LOCATION
  // ================================================
  const refreshLocation = async () => {
    try {
      setProcessing(true);
      
      const loc = await locationService.getCurrentLocation();
      if (loc.success) {
        setCurrentLocation(loc);
        
        // Calculate distance
        if (officeLocation) {
          const dist = locationService.calculateDistance(
            loc.latitude,
            loc.longitude,
            officeLocation.latitude,
            officeLocation.longitude
          );
          setDistance(dist);
        }
        
        Alert.alert('Berhasil', 'Lokasi berhasil diperbarui');
      }
      
    } catch (error) {
      console.error('Refresh location error:', error);
      Alert.alert('Error', error.message || 'Gagal mendapatkan lokasi');
    } finally {
      setProcessing(false);
    }
  };
  
  // ================================================
  // RENDER LOCATION INFO
  // ================================================
  const renderLocationInfo = () => {
    if (!officeLocation) {
      return (
        <View style={styles.infoCard}>
          <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
          <Text style={styles.infoText}>
            Lokasi kantor tidak tersedia
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Ionicons name="business" size={24} color={COLORS.primary} />
          <Text style={styles.locationTitle}>{officeLocation.name}</Text>
        </View>
        
        <Text style={styles.locationAddress}>{officeLocation.address}</Text>
        
        <View style={styles.locationDetails}>
          <View style={styles.locationDetailItem}>
            <Text style={styles.locationDetailLabel}>Radius</Text>
            <Text style={styles.locationDetailValue}>
              {officeLocation.radius}m
            </Text>
          </View>
          
          {distance !== null && (
            <View style={styles.locationDetailItem}>
              <Text style={styles.locationDetailLabel}>Jarak Anda</Text>
              <Text style={[
                styles.locationDetailValue,
                { color: distance <= officeLocation.radius ? COLORS.success : COLORS.error }
              ]}>
                {distance}m
              </Text>
            </View>
          )}
        </View>
        
        {currentLocation && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshLocation}
            disabled={processing}
          >
            <Ionicons name="refresh" size={16} color={COLORS.primary} />
            <Text style={styles.refreshButtonText}>Refresh Lokasi</Text>
          </TouchableOpacity>
        )}
        
        {distance !== null && distance > officeLocation.radius && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Anda berada di luar jangkauan kantor
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // ================================================
  // RENDER ATTENDANCE STATUS
  // ================================================
  const renderAttendanceStatus = () => {
    // Belum check-in
    if (!todayAttendance || !todayAttendance.hasCheckedIn) {
      return (
        <View style={styles.actionCard}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="log-in" size={48} color={COLORS.primary} />
          </View>
          
          <Text style={styles.actionTitle}>Check-in</Text>
          <Text style={styles.actionDescription}>
            Lakukan check-in untuk memulai hari kerja Anda
          </Text>
          
          <Button
            title="Check-in Sekarang"
            onPress={handleCheckIn}
            loading={processing}
            style={styles.actionButton}
          />
        </View>
      );
    }
    
    const attendance = todayAttendance.data;
    
    // Sudah check-in, belum check-out
    if (!todayAttendance.hasCheckedOut) {
      return (
        <View style={styles.actionCard}>
          {/* Status Check-in */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              <Text style={styles.statusTitle}>Sudah Check-in</Text>
            </View>
            
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Waktu Check-in</Text>
                <Text style={styles.statusValue}>
                  {formatTime(attendance.check_in_time)}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: attendance.status === 'present' ? COLORS.success : COLORS.warning }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {attendance.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Lokasi</Text>
                <Text style={styles.statusValue}>{attendance.office_name}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Action Check-out */}
          <View style={styles.actionIconContainer}>
            <Ionicons name="log-out" size={48} color={COLORS.secondary} />
          </View>
          
          <Text style={styles.actionTitle}>Check-out</Text>
          <Text style={styles.actionDescription}>
            Lakukan check-out untuk mengakhiri hari kerja Anda
          </Text>
          
          <Button
            title="Check-out Sekarang"
            onPress={handleCheckOut}
            loading={processing}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      );
    }
    
    // Sudah check-in dan check-out
    return (
      <View style={styles.actionCard}>
        <View style={styles.completedIcon}>
          <Ionicons name="checkmark-done-circle" size={64} color={COLORS.success} />
        </View>
        
        <Text style={styles.completedTitle}>Absensi Lengkap</Text>
        <Text style={styles.completedDescription}>
          Terima kasih atas kerja keras Anda hari ini!
        </Text>
        
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Check-in</Text>
              <Text style={styles.summaryValue}>
                {formatTime(attendance.check_in_time)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Check-out</Text>
              <Text style={styles.summaryValue}>
                {formatTime(attendance.check_out_time)}
              </Text>
            </View>
          </View>
          
          {attendance.work_duration && (
            <View style={styles.durationBox}>
              <Ionicons name="time" size={16} color={COLORS.textLight} />
              <Text style={styles.durationText}>
                Durasi Kerja: {attendance.work_duration.formatted}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // ================================================
  // RENDER
  // ================================================
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
      <Text style={styles.screenTitle}>Absensi</Text>
      
      {/* Location Info */}
      {renderLocationInfo()}
      
      {/* Attendance Status/Action */}
      {renderAttendanceStatus()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  content: {
    padding: 16,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
  },
  
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
  },
  
  // Location Card
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  
  locationAddress: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  
  locationDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  
  locationDetailItem: {
    flex: 1,
  },
  
  locationDetailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  
  locationDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 4,
  },
  
  refreshButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  
  // Action Card
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  actionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  actionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  actionButton: {
    width: '100%',
  },
  
  // Status Section
  statusSection: {
    width: '100%',
    marginBottom: 24,
  },
  
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  statusDetails: {
    gap: 12,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  
  // Completed
  completedIcon: {
    marginBottom: 16,
  },
  
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  completedDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  summaryBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  
  durationText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default AttendanceScreen;