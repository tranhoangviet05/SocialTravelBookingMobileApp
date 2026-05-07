import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Image, Alert, Switch, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Settings, Bell, Shield, HelpCircle,
  ChevronRight, LogOut, Star, Bookmark,
  CreditCard, MapPin, Globe, Moon, Info,
  Edit3, Camera
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useAuth } from '../hooks/useAuth';

const HEADER_DARK = '#0077B6';

// ─── Helper ────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Sub-components ────────────────────────────────────────────────────────
const StatBox = ({ value, label }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const MenuItem = ({ icon: Icon, label, value, onPress, danger = false, rightElement }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Icon color={danger ? Colors.danger : Colors.primary} size={20} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
    </View>
    {rightElement || (
      <ChevronRight color={danger ? Colors.danger : Colors.placeholder} size={18} />
    )}
  </TouchableOpacity>
);

// ─── Main Screen ────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Khách';
  const email = user?.email || '';
  const photoURL = user?.photoURL;

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Thử lại sau.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Sắp ra mắt', 'Tính năng chỉnh sửa hồ sơ đang được phát triển.');
  };

  return (
    <View style={styles.container}>
      {/* ── Header Gradient ── */}
      <LinearGradient
        colors={[HEADER_DARK, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handleEditProfile}>
                <Camera color="#fff" size={14} />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit3 color="#fff" size={13} />
                <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox value="0" label="Chuyến đi" />
            <View style={styles.statDivider} />
            <StatBox value="0" label="Yêu thích" />
            <View style={styles.statDivider} />
            <StatBox value="0" label="Đánh giá" />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body ── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking & Saved */}
        <SectionHeader title="Hoạt động" />
        <View style={styles.menuCard}>
          <MenuItem
            icon={CreditCard}
            label="Đặt chỗ của tôi"
            value="0 đặt chỗ"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Bookmark}
            label="Đã lưu"
            value="0 dịch vụ"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Star}
            label="Đánh giá của tôi"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
        </View>

        {/* Settings */}
        <SectionHeader title="Cài đặt" />
        <View style={styles.menuCard}>
          <MenuItem
            icon={Bell}
            label="Thông báo"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.placeholder}
              />
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Moon}
            label="Chế độ tối"
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={darkModeEnabled ? Colors.primary : Colors.placeholder}
              />
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Globe}
            label="Ngôn ngữ"
            value="Tiếng Việt"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={MapPin}
            label="Địa chỉ đã lưu"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
        </View>

        {/* Security */}
        <SectionHeader title="Bảo mật & Quyền riêng tư" />
        <View style={styles.menuCard}>
          <MenuItem
            icon={Shield}
            label="Bảo mật tài khoản"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Settings}
            label="Quyền riêng tư"
            onPress={() => Alert.alert('Sắp ra mắt', 'Tính năng đang được phát triển.')}
          />
        </View>

        {/* Support */}
        <SectionHeader title="Hỗ trợ" />
        <View style={styles.menuCard}>
          <MenuItem
            icon={HelpCircle}
            label="Trung tâm trợ giúp"
            onPress={() => Linking.openURL('https://google.com')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={Info}
            label="Về ứng dụng"
            value="v1.0.0"
            onPress={() => Alert.alert('Social Travel Booking', 'Phiên bản 1.0.0\n\nỨng dụng đặt phòng và khám phá địa điểm du lịch Việt Nam.')}
          />
        </View>

        {/* Logout */}
        <SectionHeader title="" />
        <View style={styles.menuCard}>
          <MenuItem
            icon={LogOut}
            label="Đăng xuất"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Social Travel Booking © 2026{'\n'}
          Được bảo vệ bởi Firebase Authentication
        </Text>
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──
  headerGradient: {
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  // ── Body ──
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },

  // ── Menu Card ──
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.danger + '12',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.danger,
  },
  menuValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 68,
  },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.placeholder,
    lineHeight: 20,
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
});

export default ProfileScreen;
