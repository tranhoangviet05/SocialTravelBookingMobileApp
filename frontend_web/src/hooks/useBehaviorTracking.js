import { useEffect, useRef, useCallback } from 'react';
import behaviorApi from '../api/behaviorApi';

/**
 * Hook để theo dõi hành vi người dùng (Social & Service)
 * Hỗ trợ tự động track dwell_time và các action thủ công (like, comment).
 */
export const useBehaviorTracking = (user, defaultLocationId = null, defaultServiceType = null) => {
    const startTimeRef = useRef(Date.now());
    const userId = user?.id;

    const trackAction = useCallback(async (actionType, metadata = {}) => {
        if (!userId) return;

        const data = {
            user_id: userId,
            action_type: actionType,
            location_id: metadata.location_id || defaultLocationId,
            service_type: metadata.service_type || defaultServiceType,
            service_id: metadata.service_id,
            post_id: metadata.post_id,
            comment_text: metadata.comment_text,
            dwell_time: metadata.dwell_time || 0
        };

        try {
            await behaviorApi.track(data);
            if (import.meta.env.DEV) {
                console.log('Action tracked:', actionType, data);
            }
        } catch (error) {
            console.error('Tracking error:', error);
        }
    }, [userId, defaultLocationId, defaultServiceType]);

    useEffect(() => {
        // Chỉ tự động track view nếu có location_id (trang chi tiết)
        if (!defaultLocationId) return;

        startTimeRef.current = Date.now();

        const handleUnload = () => {
            const dwellTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
            
            // Chỉ gửi nếu ở lại trên 3 giây
            if (dwellTime >= 3) {
                const type = defaultServiceType ? 'view_service' : 'view_post';
                trackAction(type, { dwell_time: dwellTime });
            }
        };

        // Lắng nghe visibilitychange để track khi thoát trang/tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleUnload();
            } else {
                startTimeRef.current = Date.now(); // Reset time when coming back
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            handleUnload();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [trackAction, defaultLocationId, defaultServiceType]);

    return { trackAction };
};
