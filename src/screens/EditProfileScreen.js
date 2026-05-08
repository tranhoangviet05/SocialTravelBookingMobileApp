import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, User, Phone,
  Calendar, Globe, Save,
  UserCircle2, CheckCircle2
} from 'lucide-react-native';
import AppText from '../components/common/AppText';
import AppTextInput from '../components/common/AppTextInput';
import { Colors } from '../constants/Colors';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/common/Skeleton';
import BirthDatePicker from '../components/profile/BirthDatePicker';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone_number: '',
    gender: 'male',
    date_of_birth: '',
    nationality: 'Việt Nam'
  });

  const datePickerRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile({
          name: response.data.name || user?.displayName || '',
          phone_number: response.data.phone_number || '',
          gender: response.data.gender || 'male',
          date_of_birth: response.data.date_of_birth || '',
          nationality: response.data.nationality || 'Việt Nam'
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên của bạn');
      return;
    }

    setSaving(true);
    try {
      const response = await profileApi.updateProfile(profile);
      if (response.success) {
        Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi lưu hồ sơ:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin hồ sơ lúc này.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chọn ngày sinh';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Chỉnh sửa hồ sơ</AppText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <UserCircle2 size={80} color={Colors.primary} strokeWidth={1} />
            </View>
            <AppText style={styles.avatarSubtitle}>Thông tin định danh khách du lịch</AppText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Họ và tên</AppText>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.primary} style={styles.inputIcon} />
                <AppTextInput
                  style={styles.input}
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  placeholder="Nhập họ và tên"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Số điện thoại</AppText>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={Colors.primary} style={styles.inputIcon} />
                <AppTextInput
                  style={styles.input}
                  value={profile.phone_number}
                  onChangeText={(text) => setProfile({ ...profile, phone_number: text })}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Giới tính</AppText>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      profile.gender === g && styles.genderButtonActive
                    ]}
                    onPress={() => setProfile({ ...profile, gender: g })}
                  >
                    <AppText style={[
                      styles.genderText,
                      profile.gender === g && styles.genderTextActive
                    ]}>
                      {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Ngày sinh</AppText>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => datePickerRef.current?.open()}
              >
                <Calendar size={20} color={Colors.primary} style={styles.inputIcon} />
                <AppText style={[styles.input, { paddingVertical: 12, color: profile.date_of_birth ? Colors.text : Colors.placeholder }]}>
                  {formatDate(profile.date_of_birth)}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Quốc tịch</AppText>
              <View style={styles.inputWrapper}>
                <Globe size={20} color={Colors.primary} style={styles.inputIcon} />
                <AppTextInput
                  style={styles.input}
                  value={profile.nationality}
                  onChangeText={(text) => setProfile({ ...profile, nationality: text })}
                  placeholder="Nhập quốc tịch"
                />
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.8 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <AppText style={styles.saveButtonText}>Lưu thay đổi</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BirthDatePicker
        bottomSheetRef={datePickerRef}
        initialDate={profile.date_of_birth}
        onSelectDate={(date) => {
          setProfile({ ...profile, date_of_birth: date.toISOString().split('T')[0] });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F0F9FF', alignItems: 'center',
    justifyContent: 'center', marginBottom: 15,
    borderWidth: 1, borderColor: '#E0F2FE'
  },
  avatarSubtitle: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: 'bold', color: Colors.text, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 15, color: Colors.text, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderButton: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F8FAFC', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  genderButtonActive: {
    backgroundColor: '#F0F9FF',
    borderColor: Colors.primary,
  },
  genderText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  genderTextActive: { color: Colors.primary, fontWeight: 'bold' },
  footer: {
    padding: 20, paddingBottom: 50, borderTopWidth: 1,
    borderTopColor: '#F1F5F9', backgroundColor: '#fff'
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 15, elevation: 8
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default EditProfileScreen;
