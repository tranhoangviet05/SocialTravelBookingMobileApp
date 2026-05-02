import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import Avatar from '../../common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ActivityItem = ({ notification, onRead }) => {
    const navigate = useNavigate();
    const { sender, type, post, is_read, created_at, id } = notification;

    const handleClick = () => {
        if (!is_read) {
            onRead(id);
        }

        if (type === 'follow') {
            navigate(`/newsfeed/profile/${sender.id}`);
        } else if (post) {
            navigate(`/newsfeed/post/${post.id}`);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'like':
                return <Heart size={14} className="fill-red-500 text-red-500" />;
            case 'comment':
                return <MessageCircle size={14} className="fill-sky-500 text-sky-500" />;
            case 'follow':
                return <UserPlus size={14} className="text-purple-500" />;
            case 'mention':
                return <AtSign size={14} className="text-green-500" />;
            default:
                return null;
        }
    };

    const getContent = () => {
        switch (type) {
            case 'like':
                return 'đã thích bài viết của bạn';
            case 'comment':
                return 'đã bình luận về bài viết của bạn';
            case 'follow':
                return 'đã bắt đầu theo dõi bạn';
            case 'mention':
                return 'đã nhắc đến bạn trong một bài viết';
            default:
                return 'đã tương tác với bạn';
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!is_read ? 'bg-sky-50/30' : ''}`}
        >
            <div className="relative">
                <Avatar src={sender?.avatar_url} alt={sender?.display_name} size="md" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                    {getIcon()}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-bold text-[15px] hover:underline cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/newsfeed/profile/${sender.id}`);
                    }}>
                        {sender?.display_name || 'Người dùng'}
                    </span>
                    <span className="text-gray-600 text-[15px]">{getContent()}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-400 text-xs">
                        {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: vi })}
                    </span>
                    {!is_read && (
                        <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
                    )}
                </div>

                {type === 'comment' && notification.data?.comment_text && (
                    <div className="mt-2 text-gray-500 text-sm italic border-l-2 border-gray-200 pl-3 py-1">
                        "{notification.data.comment_text}"
                    </div>
                )}
            </div>

            {post && post.media_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={post.media_url} alt="Post preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
};

export default ActivityItem;
