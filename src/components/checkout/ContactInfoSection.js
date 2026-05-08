import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';

const ContactInfoSection = ({ profile, user, onEdit }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Thông tin liên hệ</AppText>
        <TouchableOpacity onPress={onEdit}>
          <AppText style={styles.editLink}>Thay đổi</AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.contactCard}>
        <View style={styles.contactItem}>
          <AppText style={styles.contactLabel}>Người đặt:</AppText>
          <AppText style={styles.contactValue}>{profile?.name || user?.displayName}</AppText>
        </View>
        <View style={styles.contactItem}>
          <AppText style={styles.contactLabel}>Số điện thoại:</AppText>
          <AppText style={styles.contactValue}>{profile?.phone_number || 'Chưa cập nhật'}</AppText>
        </View>
        <View style={styles.contactItem}>
          <AppText style={styles.contactLabel}>Email:</AppText>
          <AppText style={styles.contactValue}>{user?.email}</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  editLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  contactCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  contactItem: { flexDirection: 'row', marginBottom: 8 },
  contactLabel: { width: 100, fontSize: 14, color: Colors.textSecondary },
  contactValue: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
});

export default ContactInfoSection;
