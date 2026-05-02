import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View,
  ActivityIndicator, Animated, TouchableOpacity, 
  Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import CustomButton from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';
import Toast from '../components/common/Toast';
import { loginUser } from '../utils/authService';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      toastRef.current?.show('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      // Firebase auth thành công → RootNavigator tự động chuyển sang AppNavigator
      toastRef.current?.show('Đăng nhập thành công!', 'success');
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        toastRef.current?.show('Sai email hoặc mật khẩu!', 'error');
      } else if (error.code === 'auth/user-not-found') {
        toastRef.current?.show('Tài khoản không tồn tại', 'error');
      } else {
        toastRef.current?.show('Đã có lỗi xảy ra, vui lòng thử lại', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast ref={toastRef} />

      {/* 
        ScrollView với keyboardShouldPersistTaps="handled" là cách chuẩn nhất của React Native
        - Bàn phím KHÔNG bị đóng khi click vào Input
        - Bàn phím bị đóng khi nhấn vào các nút bấm (Button, TouchableOpacity)
        - Giao diện không bị đẩy lên vì contentContainerStyle có justifyContent: 'center'
      -->
      */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
            <Text style={styles.logoText}>Social Travel Booking</Text>
            <Text style={styles.subtitle}>
              Hãy nhập thông tin của bạn để khám phá thêm nhiều điều mới cùng chúng tôi
            </Text>
          </View>
          
          <View style={styles.form}>
            <CustomInput
              label="Địa chỉ Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <CustomInput
              label="Mật khẩu"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            
            <CustomButton 
              title={loading ? <ActivityIndicator color={Colors.white} /> : "Đăng nhập"} 
              onPress={handleLogin}
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton}
              onPress={() => toastRef.current?.show('Tính năng đang phát triển', 'error')}
            >
              <Image 
                source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} 
                style={styles.googleIcon} 
              />
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Giữ nội dung ở giữa màn hình
  },
  content: {
    paddingHorizontal: Typography.spacing.lg,
    paddingVertical: Typography.spacing.xl,
  },
  header: {
    marginBottom: Typography.spacing.xl,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  logoText: {
    fontSize: Typography.size.h2,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Typography.spacing.md,
  },
  forgotPasswordText: {
    fontSize: Typography.size.caption,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  loginButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    minHeight: 56,
    marginTop: Typography.spacing.sm,
    backgroundColor: Colors.white,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Typography.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: Typography.size.small,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Typography.spacing.xl,
  },
  footerText: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: Typography.size.caption,
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
});

export default LoginScreen;
