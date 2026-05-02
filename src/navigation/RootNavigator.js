import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen';
import { Colors } from '../constants/Colors';

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
  const [isLoading, setIsLoading] = useState(true);   // Đang hiện Splash
  const [user, setUser] = useState(null);              // Firebase user

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập từ Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe; // Hủy lắng nghe khi component unmount
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
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
