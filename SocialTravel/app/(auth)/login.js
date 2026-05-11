import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth } from '@/src/api/firebase';
import AppText from '@/src/components/common/AppText';
import { Colors, Shadow } from '@/src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Lỗi đăng nhập', 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <AppText weight="bold" style={styles.appName}>
            Social<AppText weight="bold" style={{ color: Colors.primary }}>Travel</AppText>
          </AppText>
          <AppText style={styles.tagline}>Khám phá và đặt chỗ hành trình tiếp theo của bạn</AppText>
        </View>

        {/* Form Area */}
        <View style={styles.formContainer}>
          <AppText weight="bold" style={styles.title}>Đăng nhập</AppText>
          <AppText style={styles.subtitle}>Chào mừng bạn quay trở lại. Hãy đăng nhập để tiếp tục.</AppText>

          {/* Email */}
          <View style={styles.inputGroup}>
            <AppText weight="semiBold" style={styles.label}>Địa chỉ Email</AppText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: traveler@email.com"
                placeholderTextColor={Colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <AppText weight="semiBold" style={styles.label}>Mật khẩu</AppText>
              <TouchableOpacity>
                <AppText style={styles.forgotText}>Quên mật khẩu?</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor={Colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword
                  ? <Eye size={20} color={Colors.textSecondary} />
                  : <EyeOff size={20} color={Colors.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <AppText weight="bold" style={styles.loginBtnText}>Đăng nhập</AppText>
            }
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText style={styles.footerText}>Bạn chưa có tài khoản? </AppText>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <AppText weight="bold" style={styles.registerLink}>Đăng ký ngay</AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.white, paddingHorizontal: 24, paddingBottom: 40 },

  // Header
  header: { paddingTop: 80, paddingBottom: 48 },
  appName: { fontSize: 32, color: Colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: Colors.textSecondary, marginTop: 8 },

  // Form
  formContainer: {
    width: '100%',
  },
  title: { fontSize: 26, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },

  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 15, color: Colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  eyeBtn: { padding: 4 },
  forgotText: { fontSize: 14, color: Colors.primary, fontFamily: 'Quicksand-SemiBold' },

  loginBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...Shadow.medium,
  },
  loginBtnText: { color: Colors.white, fontSize: 17 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 15, color: Colors.textSecondary },
  registerLink: { fontSize: 15, color: Colors.primary },
});
