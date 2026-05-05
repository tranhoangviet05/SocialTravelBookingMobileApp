import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const ComingSoonScreen = ({ title }) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.icon}>🚧</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Tính năng này đang được phát triển</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: Colors.textSecondary },
});

export const BookingScreen = () => <ComingSoonScreen title="Đặt chỗ" />;
export const ExploreScreen = () => <ComingSoonScreen title="Khám phá" />;
export const ProfileScreen = () => <ComingSoonScreen title="Tài khoản" />;
