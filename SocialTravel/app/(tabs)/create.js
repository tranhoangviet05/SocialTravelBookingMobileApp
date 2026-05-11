import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@/src/components/common/AppText';
import { Colors } from '@/src/constants/theme';

export default function CreatePostScreen() {
  return (
    <View style={styles.container}>
      <AppText weight="bold" style={styles.title}>Đăng bài mới</AppText>
      <AppText style={styles.subtitle}>Tính năng đang được phát triển...</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
