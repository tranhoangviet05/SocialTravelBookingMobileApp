import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';

const SocialBanner = ({ onActionRestricted }) => {
  return (
    <TouchableOpacity
      style={styles.bannerWrapper}
      onPress={onActionRestricted}
      activeOpacity={0.8}
    >
      <View style={styles.socialBanner}>
        <View style={styles.textContent}>
          <AppText style={styles.bannerTitle}>Social Travel</AppText>
          <AppText style={styles.bannerDesc}>Tham gia cộng đồng để đăng bài & tương tác</AppText>
        </View>
        <View style={styles.actionArea}>
          <AppText style={styles.bannerBtnText}>Tải ngay</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  socialBanner: {
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  textContent: { flex: 1 },
  bannerTitle: { color: '#16A34A', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.3 },
  bannerDesc: { color: '#16A34A', fontSize: 11, opacity: 0.8, marginTop: 1 },
  actionArea: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});

export default SocialBanner;
