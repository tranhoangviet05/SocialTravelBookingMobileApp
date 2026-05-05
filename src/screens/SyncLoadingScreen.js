import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { authApi } from '../api/authApi';

const SyncLoadingScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Hiệu ứng fade in thông báo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Gọi API đồng bộ lên Server
    const performSync = async () => {
      try {
        console.log('SyncLoading: Bắt đầu đồng bộ dữ liệu...');
        await authApi.syncUser();
        console.log('SyncLoading: Đồng bộ thành công!');
        
        // Chuyển sang Main (Bottom Tabs) và xóa lịch sử navigation
        navigation.replace('Main');
      } catch (error) {
        console.error('SyncLoading: Lỗi đồng bộ', error);
        // Nếu lỗi vẫn cho vào Main để demo giao diện
        navigation.replace('Main'); 
      }
    };

    performSync();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} />
        
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Đang đồng bộ dữ liệu</Text>
          <Text style={styles.subtitle}>
            Quá trình này có thể mất một vài phút.{'\n'}Vui lòng chờ trong giây lát...
          </Text>
        </Animated.View>
      </View>
      
      <Text style={styles.footer}>Social Travel Booking</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  textContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.h3,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: Typography.size.small,
    color: Colors.placeholder,
    fontWeight: Typography.weight.medium,
  },
});

export default SyncLoadingScreen;
