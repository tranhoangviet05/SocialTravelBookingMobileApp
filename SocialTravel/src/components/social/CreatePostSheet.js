import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Keyboard, ActivityIndicator, Image, ScrollView, Alert, TextInput, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { uploadToCloudinary } from '../../api/cloudinary';
import AppText from '../common/AppText';
import AppAvatar from '../common/AppAvatar';
import { Colors } from '../../constants/theme';
import { Image as ImageIcon, MapPin, Hash, Paperclip, X, Plus, Search, Tag as TagIcon, Briefcase } from 'lucide-react-native';
import { socialApi } from '../../api/socialApi';
import { DeviceEventEmitter } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const CreatePostSheet = ({ innerRef, user, onPost }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // UI States
  const [activeMode, setActiveMode] = useState(null); // 'tag', 'location', 'service'
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const snapPoints = useMemo(() => ['89%'], []);

  // Fetch Locations
  useEffect(() => {
    if (activeMode === 'location') {
      const loadLocations = async () => {
        try {
          setLoadingData(true);
          const response = await socialApi.getLocations();
          if (response.success) {
            // Laravel Resource Collection wraps data in another 'data' key
            const dataArray = response.data.data || response.data;
            setLocations(Array.isArray(dataArray) ? dataArray : []);
          }
        } catch (error) {
          console.error('Load locations error:', error);
        } finally {
          setLoadingData(false);
        }
      };
      loadLocations();
    }
  }, [activeMode]);

  // Fetch Services (with simple search)
  useEffect(() => {
    if (activeMode === 'service') {
      const loadServices = async () => {
        try {
          setLoadingData(true);
          const response = await socialApi.getServices(searchQuery);
          if (response.success) {
            const dataArray = response.data.data || response.data;
            setServices(Array.isArray(dataArray) ? dataArray : []);
          }
        } catch (error) {
          console.error('Load services error:', error);
        } finally {
          setLoadingData(false);
        }
      };

      const timer = setTimeout(loadServices, searchQuery ? 500 : 0);
      return () => clearTimeout(timer);
    }
  }, [activeMode, searchQuery]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleClose = () => {
    Keyboard.dismiss();
    setActiveMode(null);
    innerRef.current?.close();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Chúng tôi cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 5, 
      quality: 1, 
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setActiveMode(null);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handlePickLocation = async (loc) => {
    if (loc === 'current') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const current = await Location.getCurrentPositionAsync({});
      setLocation({ name: 'Vị trí hiện tại', latitude: current.coords.latitude, longitude: current.coords.longitude });
    } else {
      setLocation(loc);
    }
    setActiveMode(null);
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    if (isPosting) return;

    try {
      setIsPosting(true);

      // 1. Prepare optimistic UI
      const optimisticPost = {
        id: 'temp-' + Date.now(),
        content: content.trim(),
        user: { display_name: user?.displayName, avatar_url: user?.photoURL },
        status: 'posting',
        created_at: new Date().toISOString(),
        media: images.map(img => ({ url: img.uri, type: 'image' })),
        location: location,
        tags: tags,
        service: selectedService,
      };
      
      DeviceEventEmitter.emit('OPTIMISTIC_POST', optimisticPost);
      handleClose();

      // 2. Upload images to Cloudinary
      let uploadedMedia = [];
      if (images.length > 0) {
        try {
          // Upload đồng thời các ảnh lên Cloudinary
          const uploadPromises = images.map(image => uploadToCloudinary(image.uri));
          const urls = await Promise.all(uploadPromises);
          
          uploadedMedia = urls.map((url, index) => ({
            url: url,
            type: 'image',
            width: images[index].width,
            height: images[index].height
          }));
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          throw new Error('Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.');
        }
      }

      // 3. Create post with JSON data
      const postData = {
        content: content.trim(),
        media: uploadedMedia,
        tags: tags,
        visibility: 'public'
      };

      // Only send location_id if it's a real DB location (has numeric id)
      if (location && typeof location.id === 'number') {
        postData.location_id = location.id;
      }

      if (selectedService) {
        postData.service_id = selectedService.id;
      }

      await socialApi.createPost(postData);
      
      // Clear state after success
      setContent('');
      setImages([]);
      setLocation(null);
      setTags([]);
      setSelectedService(null);
      
      if (onPost) onPost();
    } catch (error) {
      console.error('Post error:', error);
      Alert.alert('Lỗi', 'Đăng bài thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setIsPosting(false);
    }
  };

  const renderSelector = () => {
    switch (activeMode) {
      case 'tag':
        return (
          <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
              <AppText weight="bold">Thêm chủ đề</AppText>
              <TouchableOpacity onPress={() => setActiveMode(null)}><X size={20} color="#666" /></TouchableOpacity>
            </View>
            <View style={styles.tagInputWrapper}>
              <Hash size={18} color={Colors.primary} />
              <TextInput
                style={styles.inlineInput}
                placeholder="Ví dụ: dulich, vungtau..."
                value={tagInput}
                onChangeText={setTagInput}
                autoFocus
                onSubmitEditing={addTag}
              />
              <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
                <AppText style={{ color: Colors.white }}>Thêm</AppText>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'location':
        return (
          <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
              <AppText weight="bold">Gắn địa điểm</AppText>
              <TouchableOpacity onPress={() => setActiveMode(null)}><X size={20} color="#666" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.locationItem} onPress={() => handlePickLocation('current')}>
              <MapPin size={18} color={Colors.primary} />
              <AppText style={styles.locationItemText}>Vị trí hiện tại của bạn</AppText>
            </TouchableOpacity>
            {loadingData ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={locations}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.locationItem} onPress={() => handlePickLocation(item)}>
                    <MapPin size={18} color="#999" />
                    <AppText style={styles.locationItemText}>{item.name}</AppText>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        );
      case 'service':
        return (
          <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
              <AppText weight="bold">Gắn dịch vụ</AppText>
              <TouchableOpacity onPress={() => setActiveMode(null)}><X size={20} color="#666" /></TouchableOpacity>
            </View>
            <View style={styles.searchWrapper}>
              <Search size={18} color="#999" />
              <TextInput 
                style={styles.searchBar} 
                placeholder="Tìm tour, khách sạn..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {loadingData ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={services}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.serviceItem} 
                    onPress={() => { setSelectedService(item); setActiveMode(null); }}
                  >
                    <Briefcase size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <AppText weight="bold" numberOfLines={1}>{item.name}</AppText>
                      <AppText style={{ fontSize: 12, color: '#666' }}>{item.type} • {item.price_formatted || item.price}</AppText>
                    </View>
                    <Plus size={18} color="#999" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const isPostDisabled = (!content.trim() && images.length === 0) || isPosting;

  return (
    <BottomSheet
      ref={innerRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="fill"
    >
      <TouchableOpacity style={styles.contentContainer} activeOpacity={1} onPress={Keyboard.dismiss}>
        <BottomSheetView style={styles.flexFill}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerAction} onPress={handleClose}>
              <AppText style={styles.cancelText}>Hủy</AppText>
            </TouchableOpacity>
            <AppText weight="bold" style={styles.headerTitle}>News Feed</AppText>
            <TouchableOpacity
              style={[styles.postBtn, isPostDisabled && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={isPostDisabled}
            >
              {isPosting ? <ActivityIndicator size="small" color={Colors.white} /> : <AppText weight="bold" style={styles.postBtnText}>Đăng</AppText>}
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            <View style={styles.mainRow}>
              {/* Left Column: Avatars and Dynamic Line */}
              <View style={styles.leftColumn}>
                <AppAvatar src={user?.photoURL} name={user?.displayName} size={42} />
                <View style={styles.lineWrapper}>
                  <View style={styles.connectorLine} />
                </View>
                <View style={styles.smallAvatarWrapper}>
                  <AppAvatar src={user?.photoURL} name={user?.displayName} size={20} style={{ opacity: 0.6 }} />
                </View>
              </View>

              {/* Right Column: Content and Actions */}
              <View style={styles.rightColumn}>
                <View style={styles.contentBody}>
                  <AppText weight="bold" style={styles.username}>{user?.displayName || 'Người dùng'}</AppText>
                  <BottomSheetTextInput
                    placeholder="Có gì mới?"
                    placeholderTextColor="#999999"
                    multiline
                    style={styles.textInput}
                    selectionColor={Colors.primary}
                    value={content}
                    onChangeText={setContent}
                  />

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.imageScroll}
                      decelerationRate="fast"
                    >
                      {images.map((img, index) => {
                        const ratio = img.width && img.height ? img.width / img.height : 1;
                        return (
                          <View key={index} style={[styles.imagePreviewContainer, { width: 200 * ratio }]}>
                            <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImages(images.filter((_, i) => i !== index))}><X size={14} color={Colors.white} /></TouchableOpacity>
                          </View>
                        );
                      })}
                    </ScrollView>
                  )}

                  {tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {tags.map(tag => (
                        <View key={tag} style={styles.tagBadge}>
                          <AppText style={styles.tagText}>#{tag}</AppText>
                          <TouchableOpacity onPress={() => removeTag(tag)}><X size={12} color={Colors.primary} /></TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {(location || selectedService) && (
                    <View style={styles.metaRow}>
                      {location && (
                        <View style={styles.metaBadge}>
                          <MapPin size={14} color={Colors.primary} />
                          <AppText style={styles.metaText}>{location.name}</AppText>
                          <TouchableOpacity onPress={() => setLocation(null)}><X size={14} color="#999" /></TouchableOpacity>
                        </View>
                      )}
                      {selectedService && (
                        <View style={[styles.metaBadge, { backgroundColor: '#F0FDF4' }]}>
                          <Briefcase size={14} color="#10B981" />
                          <AppText style={[styles.metaText, { color: '#059669' }]}>{selectedService.name}</AppText>
                          <TouchableOpacity onPress={() => setSelectedService(null)}><X size={14} color="#059669" /></TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Actions aligned with Small Avatar */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionIcon} onPress={pickImage}><ImageIcon size={20} color={images.length > 0 ? Colors.primary : "#666"} /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => setActiveMode('tag')}><Hash size={20} color={tags.length > 0 ? Colors.primary : "#666"} /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => setActiveMode('location')}><MapPin size={20} color={location ? Colors.primary : "#666"} /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => setActiveMode('service')}><Paperclip size={20} color={selectedService ? Colors.primary : "#666"} /></TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Sub-Selectors Overlay */}
            {renderSelector()}
          </View>
        </BottomSheetView>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: { borderRadius: 30, backgroundColor: Colors.white },
  indicator: { backgroundColor: '#E0E0E0', width: 40 },
  contentContainer: { flex: 1 },
  flexFill: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 17, color: Colors.black, letterSpacing: -0.3 },
  cancelText: { fontSize: 16, color: Colors.text },
  postBtn: { backgroundColor: Colors.black, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, minWidth: 70, alignItems: 'center' },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: Colors.white, fontSize: 14 },
  mainContent: { 
    flex: 1, 
    paddingHorizontal: 22, 
    paddingTop: 16, 
    paddingBottom: 25 
  },
  mainRow: { 
    flexDirection: 'row',
    flex: 1,
  },
  leftColumn: { 
    width: 42, 
    alignItems: 'center', 
    marginRight: 12,
  },
  lineWrapper: { 
    flex: 1,
    width: 2, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginVertical: 4,
  },
  connectorLine: { 
    width: 2, 
    flex: 1, 
    backgroundColor: '#EEEEEE', 
  },
  smallAvatarWrapper: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightColumn: { 
    flex: 1, 
  },
  contentBody: {
    flex: 1,
  },
  username: { fontSize: 15, color: Colors.text, marginBottom: 4 },
  textInput: { fontSize: 16, color: Colors.text, minHeight: 60, textAlignVertical: 'top', paddingTop: 4, lineHeight: 22 },
  imageScroll: { marginTop: 10, marginBottom: 10 },
  imagePreviewContainer: { marginRight: 10, position: 'relative' },
  imagePreview: { width: 200, height: 150, borderRadius: 12, backgroundColor: '#F0F0F0' },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, gap: 5 },
  tagText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  metaRow: { gap: 8, marginBottom: 15 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', gap: 6 },
  metaText: { fontSize: 13, color: '#333' },
  actionsRow: { 
    flexDirection: 'row', 
    gap: 22, 
    height: 36,
    alignItems: 'center',
  },
  selectorContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F0F0F0', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10, maxHeight: 300 },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tagInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12 },
  inlineInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 15 },
  addTagBtn: { backgroundColor: Colors.primary, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8 },
  locationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0', gap: 10 },
  locationItemText: { fontSize: 15, color: '#333' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, marginBottom: 10 },
  searchBar: { flex: 1, paddingVertical: 8, marginLeft: 8 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  footerHint: { paddingTop: 20, paddingLeft: 54 },
  hintText: { fontSize: 14, color: '#999999' },
});

export default CreatePostSheet;
