import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDiqRkXiPH5z7N7ry9tXbsObkFARbe8XRE",
  authDomain: "socialtravelbooking.firebaseapp.com",
  projectId: "socialtravelbooking",
  storageBucket: "socialtravelbooking.firebasestorage.app",
  messagingSenderId: "381847101639",
  appId: "1:381847101639:android:1b233e080607b1f0075ee2"
};

const app = initializeApp(firebaseConfig);

// Khá»Ÿi táº¡o Auth vá»›i cÆ¡ cháº¿ lÆ°u trá»¯ bá»n vá»¯ng trÃªn React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default app;

