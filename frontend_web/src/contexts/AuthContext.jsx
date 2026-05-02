import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logOut, getCurrentUser } from '../firebase/services/authService';
import authApi from '../api/authApi';
import echo from '../utils/echo';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socialActive, setSocialActive] = useState(null);

    useEffect(() => {
        // Lắng nghe thay đổi trạng thái đăng nhập Firebase
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                setLoading(true);
                setCurrentUser(user);
                try {
                    // Lấy profile từ Backend để có role và thông tin chính xác
                    const idToken = await user.getIdToken();
                    let backendUser = null;

                    try {
                        const response = await authApi.getProfile(idToken);
                        backendUser = response?.data;
                    } catch (profileError) {
                        // Nếu user chưa tồn tại trong DB (404) → tự động sync
                        if (profileError?.response?.status === 404 || !backendUser) {
                            console.log('User chưa có trong DB, đang sync...');
                            await authApi.syncUser(idToken, {
                                displayName: user.displayName || '',
                                avatarUrl: user.photoURL || '',
                                email: user.email || '',
                            });
                            // Retry getProfile sau khi sync
                            const retryResponse = await authApi.getProfile(idToken);
                            backendUser = retryResponse?.data;
                        } else {
                            throw profileError;
                        }
                    }

                    if (backendUser) {
                        // Gộp dữ liệu từ Backend vào currentUser
                        setCurrentUser({
                            ...user,
                            ...backendUser,
                            uid: user.uid,
                            email: user.email,
                            photoURL: user.photoURL || backendUser.avatar_url,
                            displayName: user.displayName || backendUser.display_name,
                        });
                        setUserRole(backendUser.role || 'tourist');
                        setSocialActive(backendUser.social_active === true || backendUser.social_active === 1);
                    } else {
                        setUserRole('tourist');
                        setSocialActive(false);
                    }
                } catch (error) {
                    console.error('Failed to fetch user role:', error);
                    setUserRole('tourist'); // Fallback
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }

            setLoading(false);
        });

        // Lắng nghe Real-time cập nhật số lượng follow cho user hiện tại
        const channel = echo.channel('social-updates');
        channel.listen('.user.followed', (e) => {
            const { followerId, followingId, followerCount, followingCount } = e;
            
            setCurrentUser(prev => {
                if (!prev) return prev;
                
                let updated = { ...prev };
                let changed = false;

                // Nếu mình là người đi follow (follower) -> Cập nhật số người mình đang theo dõi (following_count)
                if (String(prev.id) === String(followerId)) {
                    updated = {
                        ...updated,
                        social_profile: {
                            ...updated.social_profile,
                            following_count: followingCount
                        }
                    };
                    changed = true;
                }

                // Nếu mình là người được follow (following) -> Cập nhật số người theo dõi mình (followers_count)
                if (String(prev.id) === String(followingId)) {
                    updated = {
                        ...updated,
                        social_profile: {
                            ...updated.social_profile,
                            followers_count: followerCount
                        }
                    };
                    changed = true;
                }

                return changed ? updated : prev;
            });
        });

        return () => {
            unsubscribe();
            channel.stopListening('.user.followed');
        };
    }, []);

    const refreshProfile = async () => {
        try {
            const firebaseUser = getCurrentUser();
            if (!firebaseUser) return;
            const idToken = await firebaseUser.getIdToken();
            const response = await authApi.getProfile(idToken);
            const backendUser = response?.data;

            if (backendUser) {
                setCurrentUser(prev => ({
                    ...prev,
                    ...backendUser,
                    photoURL: firebaseUser.photoURL || backendUser.avatar_url,
                    displayName: firebaseUser.displayName || backendUser.display_name,
                }));
                setSocialActive(backendUser.social_active === true || backendUser.social_active === 1);
                setUserRole(backendUser.role || 'tourist');
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    };

    const refreshSocialStatus = async () => {
        try {
            const firebaseUser = getCurrentUser();
            if (!firebaseUser) return;
            const idToken = await firebaseUser.getIdToken();
            const response = await authApi.checkSocialStatus(idToken);
            setSocialActive(response.data.social_active);
        } catch (error) {
            console.error('Failed to refresh social status:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
            setCurrentUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        currentUser,
        userRole,
        loading,
        logout: handleLogout,
        refreshSocialStatus,
        refreshProfile,
        socialActive,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
