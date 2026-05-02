import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import { Colors } from './src/constants/Colors';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  // Hàm này được gọi khi Splash Screen hoàn tất animation
  const handleSplashFinish = () => {
    setIsAppReady(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {!isAppReady ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <LoginScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
