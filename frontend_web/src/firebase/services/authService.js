// Firebase Authentication helper functions
// Sử dụng: import { signIn, signUp, signOut, ... } from './authService'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase.config";

// ========================
// ĐĂNG KÝ tài khoản mới
// ========================
export const signUp = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Cập nhật tên người dùng sau khi đăng ký
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
};

// ========================
// ĐĂNG NHẬP bằng Email/Password
// ========================
export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ========================
// ĐĂNG NHẬP bằng Google
// ========================
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

// ========================
// ĐĂNG XUẤT
// ========================
export const logOut = async () => {
  await signOut(auth);
};

// ========================
// QUÊN MẬT KHẨU
// ========================
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// ========================
// THEO DÕI trạng thái đăng nhập
// Sử dụng trong useEffect để lắng nghe thay đổi trạng thái auth
// ========================
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ========================
// LƯU dữ liệu người dùng mạng xã hội
// Sử dụng trong useEffect để lắng nghe thay đổi trạng thái auth
// ========================

// ========================
// LẤY user hiện tại
// ========================
export const getCurrentUser = () => {
  return auth.currentUser;
};
