// Firebase Auth Service cho Flutter
// Cung cấp các phương thức xác thực người dùng

import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // Lấy user hiện tại
  static User? get currentUser => _auth.currentUser;

  // Stream theo dõi trạng thái Auth (dùng trong StreamProvider/StreamBuilder)
  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  // ========================
  // ĐĂNG KÝ bằng Email/Password
  // ========================
  static Future<UserCredential> signUp({
    required String email,
    required String password,
    String? displayName,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (displayName != null) {
      await credential.user?.updateDisplayName(displayName);
    }
    return credential;
  }

  // ========================
  // ĐĂNG NHẬP bằng Email/Password
  // ========================
  static Future<UserCredential> signIn({
    required String email,
    required String password,
  }) async {
    return await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  // ========================
  // ĐĂNG XUẤT
  // ========================
  static Future<void> signOut() async {
    await _auth.signOut();
  }

  // ========================
  // QUÊN MẬT KHẨU
  // ========================
  static Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // ========================
  // CẬP NHẬT thông tin profile
  // ========================
  static Future<void> updateProfile({
    String? displayName,
    String? photoURL,
  }) async {
    await _auth.currentUser?.updateDisplayName(displayName);
    await _auth.currentUser?.updatePhotoURL(photoURL);
  }
}
