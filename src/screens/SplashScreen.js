import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const { height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const slideAnim = useRef(new Animated.Value(height / 4)).current; // Giảm khoảng cách trượt cho mượt hơn
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <Animated.Text style={styles.text}>
          Social Travel Booking
        </Animated.Text>
        
        {/* Thay thế gạch dưới bằng Loading iOS */}
        <ActivityIndicator 
          size="small" 
          color={Colors.primary} 
          style={styles.loader} 
        />
      </Animated.View>
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
    fontSize: Typography.size.h2,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;
