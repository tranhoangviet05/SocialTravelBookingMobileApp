import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import AppTextInput from '../common/AppTextInput';
import { Colors } from '../../constants/Colors';

const ContactInfoSection = ({ localContactName, setLocalContactName, localContactPhone, setLocalContactPhone, user }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Thông tin liên hệ</AppText>
      </View>
      <View style={styles.contactCard}>
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Người đặt <AppText style={styles.required}>*</AppText></AppText>
          <AppTextInput
            style={styles.input}
            value={localContactName}
            onChangeText={setLocalContactName}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Số điện thoại <AppText style={styles.required}>*</AppText></AppText>
          <AppTextInput
            style={styles.input}
            value={localContactPhone}
            onChangeText={setLocalContactPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Email</AppText>
          <AppTextInput
            style={[styles.input, { backgroundColor: '#F8FAFC', color: '#64748B' }]}
            value={user?.email}
            editable={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  contactCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  required: { color: '#EF4444' },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
});

export default ContactInfoSection;
