import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Đăng nhập
 * Chỉ thực hiện xác thực với Firebase.
 * Việc đồng bộ sẽ được xử lý bởi SyncLoadingScreen sau khi điều hướng.
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Đăng ký
 * Tạo tài khoản Firebase và cập nhật thông tin cơ bản.
 */
export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Cập nhật tên hiển thị ngay lập tức
  await updateProfile(userCredential.user, { displayName: name });
  
  return userCredential.user;
};

/**
 * Đăng xuất
 */
export const logoutUser = async () => {
  await signOut(auth);
};
