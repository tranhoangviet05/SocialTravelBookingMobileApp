import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View,
  ActivityIndicator, Animated, TouchableOpacity,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import CustomButton from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';
import Toast from '../components/common/Toast';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, isAuthenticating } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleRegister = async () => {
    const result = await register(name, email, password, confirmPassword);

    if (result.success) {
      toastRef.current?.show('Tạo tài khoản thành công!', 'success');
    } else {
      toastRef.current?.show(result.message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast ref={toastRef} />

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
            <Text style={styles.logoText}>Social Travel Booking</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình khám phá của bạn
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={name}
              onChangeText={setName}
            />

            <CustomInput
              label="Địa chỉ Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <CustomInput
              label="Mật khẩu"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <CustomButton
              title={isAuthenticating ? <ActivityIndicator color={Colors.white} /> : "Đăng ký"}
              onPress={handleRegister}
              style={styles.registerButton}
            />

            {/* Chính sách */}
            <Text style={styles.policyText}>
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Text style={styles.link}>Điều khoản dịch vụ</Text>
              {' '}và{' '}
              <Text style={styles.link}>Chính sách bảo mật</Text>
              {' '}của chúng tôi.
            </Text>

            {/* Đã có tài khoản */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Đăng nhập ngay</Text>
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
    justifyContent: 'center',
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
  registerButton: {
    marginTop: Typography.spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  policyText: {
    fontSize: Typography.size.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Typography.spacing.lg,
    lineHeight: 20,
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

export default RegisterScreen;
