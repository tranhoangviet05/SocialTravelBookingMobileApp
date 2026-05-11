import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth } from '@/src/api/firebase';
import AppText from '@/src/components/common/AppText';
import { Colors, Shadow } from '@/src/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
      Alert.alert('Lỗi đăng ký', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <AppText weight="bold" style={styles.appName}>
            Social<AppText weight="bold" style={{ color: Colors.primary }}>Travel</AppText>
          </AppText>
          <AppText style={styles.tagline}>Tham gia cộng đồng du lịch lớn nhất thế giới</AppText>
        </View>

        <View style={styles.formContainer}>
          <AppText weight="bold" style={styles.title}>Tạo tài khoản</AppText>
          <AppText style={styles.subtitle}>Bắt đầu hành trình khám phá của bạn ngay hôm nay.</AppText>

          {[
            { label: 'Họ và tên', placeholder: 'Ví dụ: Nguyễn Văn A', value: name, setter: setName, type: 'default' },
            { label: 'Địa chỉ Email', placeholder: 'Ví dụ: travel@email.com', value: email, setter: setEmail, type: 'email-address' },
          ].map((field, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <AppText weight="semiBold" style={styles.label}>{field.label}</AppText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.placeholder}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.type}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <AppText weight="semiBold" style={styles.label}>Mật khẩu</AppText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={Colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <Eye size={20} color={Colors.textSecondary} /> : <EyeOff size={20} color={Colors.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.8 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <AppText weight="bold" style={styles.registerBtnText}>Đăng ký</AppText>
            }
          </TouchableOpacity>

          <AppText style={styles.terms}>
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <AppText weight="bold" style={{ color: Colors.primary }}>Điều khoản dịch vụ</AppText>
            {' '}và{' '}
            <AppText weight="bold" style={{ color: Colors.primary }}>Chính sách bảo mật</AppText>
            {' '}của chúng tôi.
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>Bạn đã có tài khoản? </AppText>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <AppText weight="bold" style={styles.loginLink}>Đăng nhập</AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.white, paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 40 },
  appName: { fontSize: 32, color: Colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: Colors.textSecondary, marginTop: 8 },
  formContainer: { width: '100%' },
  title: { fontSize: 26, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, color: Colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 8, paddingHorizontal: 16, height: 52,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontFamily: 'Quicksand-Medium', fontSize: 16, color: Colors.text },
  eyeBtn: { padding: 4 },
  registerBtn: {
    backgroundColor: Colors.primary, height: 54, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginTop: 12, ...Shadow.medium,
  },
  registerBtnText: { color: Colors.white, fontSize: 17 },
  terms: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 24, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 15, color: Colors.textSecondary },
  loginLink: { fontSize: 15, color: Colors.primary },
});
