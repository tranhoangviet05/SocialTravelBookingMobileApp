import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { NativeModules } from 'react-native';
import { auth } from '../config/firebase';
import {
  loginUser,
  registerUser,
  logoutUser
} from '../utils/authService';

// Kiểm tra module Native một cách an toàn nhất (Không gây crash)
const isGoogleNativeModuleAvailable = !!NativeModules.RNGoogleSignin;

let GoogleSignin = null;
if (isGoogleNativeModuleAvailable) {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (e) {
    console.log('Google Sign-In module found but failed to load');
  }
}

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isGoogleAvailable = !!GoogleSignin;

  useEffect(() => {
    // Cấu hình Google Sign-In (Bọc trong try-catch để tránh crash trên Expo Go)
    if (isGoogleAvailable) {
      try {
        GoogleSignin.configure({
          webClientId: '381847101639-6blgreq7lfht6ocvtlabacau1fjqg7l9.apps.googleusercontent.com',
          offlineAccess: true,
        });
      } catch (error) {
        console.log('Google Sign-In configuration failed', error);
      }
    }

    // Lắng nghe trạng thái đăng nhập từ Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userToken = await firebaseUser.getIdToken();
        setToken(userToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin' };
    }

    setIsAuthenticating(true);
    try {
      const loggedInUser = await loginUser(email, password);
      return { success: true, user: loggedInUser };
    } catch (error) {
      let message = 'Đã có lỗi xảy ra, vui lòng thử lại';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
        message = 'Email hoặc mật khẩu không chính xác';
      }
      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    // Validation logic moved from screen to store
    if (!name.trim()) return { success: false, message: 'Vui lòng nhập họ tên của bạn' };
    if (!email.trim()) return { success: false, message: 'Vui lòng nhập địa chỉ email' };
    if (password.length < 6) return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    if (password !== confirmPassword) return { success: false, message: 'Mật khẩu xác nhận không khớp' };

    setIsAuthenticating(true);
    try {
      const registeredUser = await registerUser(name, email, password);
      return { success: true, user: registeredUser };
    } catch (error) {
      let message = 'Đã có lỗi xảy ra, vui lòng thử lại';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ';
      } else if (error.code === 'auth/weak-password') {
        message = 'Mật khẩu quá yếu, hãy chọn mật khẩu mạnh hơn';
      }
      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthenticating(true);
    try {
      // Kiểm tra xem module native có tồn tại không (Tránh lỗi trên Expo Go)
      if (!isGoogleAvailable) {
        throw new Error('Google Sign-In không khả dụng trên Expo Go. Vui lòng sử dụng Development Build.');
      }

      // Kiểm tra thiết bị có Google Play Services không
      await GoogleSignin.hasPlayServices();

      // Bắt đầu quy trình đăng nhập Google
      const userInfo = await GoogleSignin.signIn();

      // Lấy ID Token từ kết quả đăng nhập (cấu trúc mới của thư viện trả về data.idToken)
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (!idToken) {
        throw new Error('Không lấy được ID Token từ Google');
      }

      // Tạo Firebase credential từ Google ID Token
      const credential = GoogleAuthProvider.credential(idToken);

      // Đăng nhập vào Firebase bằng credential vừa tạo
      const userCredential = await signInWithCredential(auth, credential);

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      let message = 'Đăng nhập Google thất bại';

      // Một số mã lỗi phổ biến
      if (error.code === 'SIGN_IN_CANCELLED') {
        message = 'Bạn đã hủy đăng nhập';
      } else if (error.code === 'IN_PROGRESS') {
        message = 'Đang trong quá trình xử lý đăng nhập';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services không khả dụng';
      }

      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticating,
      login,
      register,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
