import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';
import { socialApi } from '../api/socialApi';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  hasProfile: false,
  checkUserProfile: async () => {},
  setHasProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const checkUserProfile = useCallback(async () => {
    try {
      const response = await socialApi.checkProfile();
      // Backend trả về { success: true, data: { social_active: true/false } }
      if (response.success && response.data && response.data.social_active) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.log('AuthContext: Error checking profile', error);
      setHasProfile(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Đồng bộ user và lấy ID từ database
          const syncResponse = await socialApi.syncUser();
          const dbUser = syncResponse.success ? syncResponse.data : null;
          
          await checkUserProfile();
          
          // Kết hợp dữ liệu Firebase và Database
          setUser({
            ...firebaseUser,
            dbId: dbUser?.id, // ID từ bảng users (UUID)
          });
        } catch (error) {
          console.log('AuthContext: Sync failed', error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [checkUserProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      hasProfile,
      checkUserProfile,
      setHasProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
