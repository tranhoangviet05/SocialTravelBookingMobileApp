import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import CustomButton from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';
import Toast from '../components/common/Toast';
import { Mail, Lock, LogIn } from 'lucide-react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      toastRef.current?.show('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    setLoading(true);
    try {
      // Giả lập thời gian chờ xử lý mượt mà
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await signInWithEmailAndPassword(auth, email, password);
      toastRef.current?.show('Đăng nhập thành công!', 'success');
    } catch (error) {
      toastRef.current?.show('Sai email hoặc mật khẩu. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast ref={toastRef} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <MotiView 
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.content}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
            <Text style={styles.logoText}>Social Travel Booking</Text>
            <Text style={styles.subtitle}>
              Hãy nhập thông tin của bạn để khám phá thêm nhiều điều mới cùng chúng tôi
            </Text>
          </View>
          
          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <CustomInput
                placeholder="Địa chỉ Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <CustomInput
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
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

            <CustomButton 
              title="Tiếp tục với Google" 
              type="outline"
              onPress={() => toastRef.current?.show('Tính năng đang phát triển', 'error')}
              style={styles.googleButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <Text style={styles.link}>Đăng ký ngay</Text>
            </View>
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Typography.spacing.lg,
    justifyContent: 'center',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
    top: 28, // Căn chỉnh giữa theo CustomInput
  },
  loginButton: {
    marginTop: Typography.spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButton: {
    marginTop: Typography.spacing.sm,
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
