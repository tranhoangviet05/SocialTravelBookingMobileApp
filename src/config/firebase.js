import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiqRkXiPH5z7N7ry9tXbsObkFARbe8XRE",
  authDomain: "socialtravelbooking.firebaseapp.com",
  projectId: "socialtravelbooking",
  storageBucket: "socialtravelbooking.firebasestorage.app",
  messagingSenderId: "381847101639",
  appId: "1:381847101639:android:1b233e080607b1f0075ee2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with Persistence
// This ensures the user stays logged in after restarting the app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default app;
