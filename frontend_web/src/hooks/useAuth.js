// Custom React Hook - useAuth
// Theo dõi trạng thái đăng nhập Firebase và cung cấp user hiện tại
// 
// Sử dụng:
//   const { user, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (!user) return <Navigate to="/login" />;

import { useState, useEffect } from "react";
import { onAuthChange } from "../firebase/services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đăng ký lắng nghe thay đổi trạng thái auth
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup: hủy đăng ký khi component unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
};
