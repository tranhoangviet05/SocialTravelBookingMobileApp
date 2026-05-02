import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Smile, MapPin, Hash, ChevronDown, Globe, Plus, ChevronRight, ArrowRight } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Avatar from '../../common/Avatar';
import { useAdminData } from '../../../contexts/AdminDataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { uploadImage } from '../../../utils/cloudinary';
import socialApi from '../../../api/socialApi';
import serviceApi from '../../../api/serviceApi';
import { Briefcase } from 'lucide-react';
import { useSocialData } from '../../../contexts/SocialDataContext';
import { formatCurrency } from '../../../utils/Helpers';

const CreatePostModal = ({ isOpen, onClose }) => {
    const { locations, fetchLocations } = useAdminData();
    const { currentUser } = useAuth();
    const { addPostToState, updatePostInState, removePostFromState } = useSocialData();
    const notification = useNotification();

    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [showLocationList, setShowLocationList] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showServiceSearch, setShowServiceSearch] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviceSearchValue, setServiceSearchValue] = useState('');
    const [suggestedServices, setSuggestedServices] = useState([]);
    const [showHashtagInput, setShowHashtagInput] = useState(false);
    const [hashtagValue, setHashtagValue] = useState('');
    const [hashtags, setHashtags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isSearchingService, setIsSearchingService] = useState(false);

    const emojiPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setMediaFiles([]);
            setSelectedLocation(null);
            setHashtags([]);
            setContent('');
            setHashtagValue('');
            setSuggestedTags([]);
        }
    }, [isOpen]);

    // Gợi ý Hashtag
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (hashtagValue.trim().length > 0) {
                try {
                    const response = await socialApi.getTagSuggestions(hashtagValue);
                    if (response.data.success) {
                        setSuggestedTags(response.data.data);
                    }
                } catch (e) {
                    console.error("Tag suggestion error:", e);
                }
            } else {
                setSuggestedTags([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [hashtagValue]);

    // Gợi ý Dịch vụ
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (serviceSearchValue.trim().length > 1) {
                try {
                    setIsSearchingService(true);
                    const response = await serviceApi.getServices({ keyword: serviceSearchValue, limit: 5 });
                    if (response.success) {
                        // Handle both direct array and paginated object
                        const data = response.data.data || response.data;
                        setSuggestedServices(Array.isArray(data) ? data : []);
                    }
                } catch (e) {
                    console.error("Service suggestion error:", e);
                } finally {
                    setIsSearchingService(false);
                }
            } else {
                setSuggestedServices([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [serviceSearchValue]);

    const handlePostSubmit = async () => {
        if (!content.trim() && mediaFiles.length === 0) return;

        const tempId = `temp-${Date.now()}`;
        const tempPost = {
            id: tempId,
            content,
            media: mediaFiles.map(m => ({ url: m.url, type: m.type })),
            tags: hashtags.map(h => ({ name: h, display_name: h })),
            location: selectedLocation,
            service: selectedService,
            user_id: currentUser?.id,
            author: {
                id: currentUser?.id,
                display_name: currentUser?.display_name || currentUser?.displayName,
                avatar_url: currentUser?.avatar_url || currentUser?.photoURL,
                is_following: false
            },
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            created_at: new Date().toISOString(),
            isSending: true
        };

        // 1. Thêm vào feed ngay lập tức
        addPostToState(tempPost);
        onClose();
        
        // Reset form
        setContent('');
        setMediaFiles([]);
        setHashtags([]);
        setSelectedLocation(null);
        setSelectedService(null);

        // 2. Xử lý đăng bài trong background
        try {
            // Upload ảnh
            const mediaData = [];
            for (const item of mediaFiles) {
                const url = await uploadImage(item.file);
                mediaData.push({ url, type: item.type });
            }

            const postData = {
                content,
                media: mediaData,
                tags: hashtags,
                location_id: selectedLocation?.id,
                service_id: selectedService?.id,
                visibility: 'public'
            };

            const response = await socialApi.createPost(postData);
            if (response.success) {
                // Thay thế bài viết tạm thời bằng bài viết thật từ API
                updatePostInState(tempId, { ...response.data, isSending: false });
                notification.success("Bài viết đã được đăng!");
            } else {
                throw new Error("Đăng bài không thành công");
            }
        } catch (error) {
            console.error("Submit post error:", error);
            notification.error(error.message || "Lỗi khi đăng bài");
            // Xóa bài viết tạm thời nếu lỗi
            removePostFromState(tempId);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video'
        }));
        setMediaFiles(prev => [...prev, ...newFiles]);
    };

    const removeMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addHashtag = (tag) => {
        const cleanHash = (tag || hashtagValue).trim().replace(/^#/, '');
        if (cleanHash && !hashtags.includes(cleanHash)) {
            setHashtags(prev => [...prev, cleanHash]);
        }
        setHashtagValue('');
        setSuggestedTags([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="bg-white w-full max-w-[600px] rounded-3xl shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button onClick={onClose} className="text-[15px] font-medium text-gray-500 hover:text-black">Hủy</button>
                    <h2 className="text-[16px] font-bold">News Feed</h2>
                    <button
                        onClick={handlePostSubmit}
                        disabled={isPosting || (!content.trim() && mediaFiles.length === 0)}
                        className={`px-5 py-1.5 rounded-full font-bold text-sm transition-all ${(content.trim() || mediaFiles.length > 0) && !isPosting
                            ? 'bg-black text-white hover:scale-105'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isPosting ? 'Đang đăng...' : 'Đăng'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 flex gap-4">
                        <div className="flex flex-col items-center">
                            <Avatar src={currentUser?.avatar_url} alt={currentUser?.display_name} size="md" />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-[15px]">{currentUser?.display_name || "Me"}</span>

                                {showHashtagInput && (
                                    <div className="relative flex items-center gap-1 text-gray-400">
                                        <ChevronDown size={14} className="-rotate-90" />
                                        <input
                                            autoFocus
                                            placeholder="Chủ đề..."
                                            value={hashtagValue}
                                            onChange={(e) => setHashtagValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                                            className="bg-transparent border-none outline-none text-[15px] font-medium text-sky-500 w-32 p-0 placeholder:text-gray-300"
                                        />
                                        {suggestedTags.length > 0 && (
                                            <div className="absolute top-6 left-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 z-50 py-1">
                                                {suggestedTags.map(tag => (
                                                    <div
                                                        key={tag.id}
                                                        onClick={() => addHashtag(tag.display_name)}
                                                        className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-sky-600"
                                                    >
                                                        #{tag.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedLocation && (
                                    <div className="flex items-center gap-1 text-[12px] text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-full ml-auto">
                                        <MapPin size={12} />
                                        <span>{selectedLocation.name}</span>
                                        <X size={10} className="cursor-pointer" onClick={() => setSelectedLocation(null)} />
                                    </div>
                                )}

                                {selectedService && (
                                    <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full ml-auto border border-emerald-100">
                                        <Briefcase size={12} />
                                        <span className="truncate max-w-[120px]">{selectedService.name}</span>
                                        <X size={10} className="cursor-pointer" onClick={() => setSelectedService(null)} />
                                    </div>
                                )}
                            </div>

                            <textarea
                                autoFocus
                                placeholder="Có gì mới?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[100px] text-[15px] outline-none border-none p-0 placeholder:text-gray-400 bg-transparent resize-none"
                            />

                            {mediaFiles.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {mediaFiles.map((media, index) => (
                                        <div key={index} className="relative w-24 h-32 rounded-xl overflow-hidden group">
                                            <img src={media.url} className="w-full h-full object-cover" alt="Preview" />
                                            <button onClick={() => removeMedia(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-2">
                                {hashtags.map((tag, idx) => (
                                    <span key={idx} className="text-[13px] text-sky-600 font-medium bg-sky-50 px-3 py-1 rounded-lg flex items-center gap-1">
                                        #{tag}
                                        <X size={12} className="cursor-pointer" onClick={() => setHashtags(prev => prev.filter((_, i) => i !== idx))} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Toolbar Area */}
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center gap-6 text-gray-400 relative">
                        <input type="file" hidden ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current.click()} className="hover:text-black transition-colors"><Image size={22} /></button>

                        <div className="relative">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`transition-colors ${showEmojiPicker ? 'text-sky-500' : 'hover:text-black'}`}
                            >
                                <Smile size={22} />
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-4 z-50">
                                    <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)}></div>
                                    <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                                        <EmojiPicker
                                            onEmojiClick={(e) => setContent(c => c + e.emoji)}
                                            theme="light"
                                            width={320}
                                            height={400}
                                            autoFocusSearch={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => { if (!showLocationList) fetchLocations(); setShowLocationList(!showLocationList); }}
                                className={`transition-colors ${showLocationList ? 'text-sky-500' : 'hover:text-black'}`}
                            >
                                <MapPin size={22} />
                            </button>
                            {showLocationList && (
                                <div className="absolute bottom-full left-0 mb-4 w-72 bg-white shadow-2xl rounded-2xl p-2 border border-gray-100 z-50">
                                    <div className="fixed inset-0" onClick={() => setShowLocationList(false)}></div>
                                    <div className="relative max-h-64 overflow-y-auto custom-scrollbar">
                                        <div className="p-2 border-b border-gray-50 mb-1 sticky top-0 bg-white z-10">
                                            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Gắn thẻ địa điểm</span>
                                        </div>
                                        {locations.map(loc => (
                                            <div key={loc.id} onClick={() => { setSelectedLocation(loc); setShowLocationList(false); }} className="px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer text-sm truncate transition-colors">
                                                {loc.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowServiceSearch(!showServiceSearch)} 
                                className={`transition-colors ${showServiceSearch ? 'text-emerald-500' : 'hover:text-black'}`}
                                title="Gắn link dịch vụ"
                            >
                                <Briefcase size={22} />
                            </button>
                            {showServiceSearch && (
                                <div className="absolute bottom-full left-0 mb-4 w-80 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 z-50 animate-in slide-in-from-bottom-2 duration-200">
                                    <div className="fixed inset-0" onClick={() => setShowServiceSearch(false)}></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[13px] font-bold text-gray-800">Gắn link dịch vụ</span>
                                            {isSearchingService && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                                        </div>
                                        <input 
                                            autoFocus
                                            type="text"
                                            placeholder="Tìm kiếm tour, khách sạn..."
                                            value={serviceSearchValue}
                                            onChange={(e) => setServiceSearchValue(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                                        />
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                            {suggestedServices.length > 0 ? (
                                                suggestedServices.map(svc => (
                                                    <div 
                                                        key={svc.id} 
                                                        onClick={() => { setSelectedService(svc); setShowServiceSearch(false); setServiceSearchValue(''); }} 
                                                        className="flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            <img src={svc.media?.[0]?.url || svc.thumbnail} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-700 truncate group-hover:text-emerald-600">{svc.name}</p>
                                                            <p className="text-[11px] text-gray-400 font-medium">{formatCurrency(svc.base_price)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : serviceSearchValue.length > 1 ? (
                                                <p className="text-center py-4 text-xs text-gray-400">Không tìm thấy kết quả</p>
                                            ) : (
                                                <p className="text-center py-4 text-xs text-gray-400 italic">Nhập từ khóa để tìm kiếm...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setShowHashtagInput(!showHashtagInput)} className={`transition-colors ${showHashtagInput ? 'text-sky-500' : 'hover:text-black'}`}><Hash size={22} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;
