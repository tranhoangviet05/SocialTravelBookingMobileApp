import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { logoutUser } from '../utils/authService';

const HomeScreen = () => {
  const handleLogout = async () => {
    await logoutUser();
    // Firebase auth state thay đổi → RootNavigator tự động chuyển về AuthNavigator
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.logo}>Social Travel Booking</Text>

        <View style={styles.card}>
          <Text style={styles.icon}>🚧</Text>
          <Text style={styles.title}>Đang phát triển</Text>
          <Text style={styles.subtitle}>
            Tính năng đang được phát triển,{'\n'}hãy quay lại sau nhé!
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Typography.spacing.lg,
  },
  logo: {
    fontSize: Typography.size.h3,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: Typography.spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Typography.spacing.xl,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 56,
    marginBottom: Typography.spacing.md,
  },
  title: {
    fontSize: Typography.size.h3,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: Typography.spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: Typography.spacing.xl,
    paddingVertical: Typography.spacing.sm,
    paddingHorizontal: Typography.spacing.lg,
  },
  logoutText: {
    fontSize: Typography.size.caption,
    color: Colors.danger,
    fontWeight: Typography.weight.medium,
  },
});

export default HomeScreen;
