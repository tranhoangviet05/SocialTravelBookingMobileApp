import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen';
import { Colors } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';

/**
 * RootNavigator: Điều phối toàn bộ ứng dụng
 *
 * Luồng:
 *   1. Khởi động → Splash (2.5s)
 *   2. Firebase khôi phục trạng thái đăng nhập
 *   3. Đã đăng nhập → AppNavigator (Home, ...)
 *      Chưa đăng nhập → AuthNavigator (Login, Register)
 */
const RootNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSplashLoading, setIsSplashLoading] = useState(true);   // Đang hiện Splash

  const handleSplashFinish = () => {
    setIsSplashLoading(false);
  };

  if (isSplashLoading || authLoading) {
    return (
      <View style={styles.container}>
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  // Firebase đã xác nhận trạng thái → hiện đúng navigator
  return user ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
});

export default RootNavigator;
