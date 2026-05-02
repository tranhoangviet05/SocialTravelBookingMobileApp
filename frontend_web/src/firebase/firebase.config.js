// ============================================================
// FIREBASE CONFIGURATION - frontend_web
// ============================================================
// Thay thế các giá trị bên dưới bằng thông tin Firebase project của bạn.
// Lấy từ: Firebase Console -> Project Settings -> Your apps -> Web app
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA51XmvcPlcvl9aTkVjN5PE__xuEoFzgME",
  authDomain: "socialtravelbooking.firebaseapp.com",
  projectId: "socialtravelbooking",
  storageBucket: "socialtravelbooking.firebasestorage.app",
  messagingSenderId: "381847101639",
  appId: "1:381847101639:web:fad4a94c294b2b6e075ee2",
  measurementId: "G-XSNZ6G8B7H"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo Firebase Auth
const auth = getAuth(app);

// Khởi tạo Firestore
const db = getFirestore(app);

export { app, auth, db, analytics };
