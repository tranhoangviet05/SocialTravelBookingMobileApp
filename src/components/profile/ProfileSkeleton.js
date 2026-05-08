import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import Skeleton from '../common/Skeleton';

const ProfileSkeleton = ({ styles: screenStyles }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40, height: 40 }} />
        <Skeleton width={120} height={20} borderRadius={4} />
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Skeleton width={100} height={100} borderRadius={50} />
          <Skeleton width={200} height={15} borderRadius={4} style={{ marginTop: 15 }} />
        </View>
        <View style={styles.form}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.inputGroup}>
              <Skeleton width={80} height={12} borderRadius={4} />
              <Skeleton width="100%" height={50} borderRadius={16} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  form: { paddingHorizontal: 5 },
  inputGroup: { marginBottom: 20 },
});

export default ProfileSkeleton;
