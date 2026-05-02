import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Android and iOS, Firebase will use these settings
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

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
