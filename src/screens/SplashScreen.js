import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { MotiText, MotiView } from 'moti';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const { height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    // Chờ 2.5 giây để đảm bảo tính thương mại và tải xong dữ liệu
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 1000 }}
        style={styles.logoContainer}
      >
        <MotiText
          from={{ translateY: height / 2 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 1500 }}
          style={styles.text}
        >
          Social Travel Booking
        </MotiText>
        
        <MotiView 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1000, duration: 1000 }}
          style={styles.indicatorContainer}
        >
          <View style={styles.line} />
        </MotiView>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: Typography.size.h1,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  indicatorContainer: {
    marginTop: 20,
    width: 40,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default SplashScreen;
