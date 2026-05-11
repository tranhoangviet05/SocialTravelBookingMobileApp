import React, { useState, useRef } from 'react';
import { StyleSheet, View, FlatList, Animated, useWindowDimensions, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import AppText from '@/src/components/common/AppText';
import { Colors, Shadow } from '@/src/constants/theme';
import { socialApi } from '@/src/api/socialApi';
import { useAuth } from '@/src/contexts/AuthContext';

const ONBOARDING_DATA = [
  { id: '1', title: 'Chào mừng đến với\nSocial Travel', description: 'Cộng đồng dành cho những tâm hồn đam mê xê dịch, nơi bạn có thể chia sẻ trải nghiệm du lịch tuyệt vời.' },
  { id: '2', title: 'Khám phá điểm đến', description: 'Tìm kiếm những địa điểm mới lạ qua góc nhìn của cộng đồng. Đừng quên đánh dấu và lưu lại cho chuyến đi tiếp theo!' },
  { id: '3', title: 'Kết nối và Chia sẻ', description: 'Kết bạn với những người cùng sở thích, chia sẻ những khoảnh khắc đáng nhớ qua từng bức ảnh và bài viết.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { checkUserProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      if (!nickname.trim()) return;
      setLoading(true);
      try {
        const response = await socialApi.createProfile({ nickname, bio });
        if (response.success) {
          await checkUserProfile();
          router.replace('/(tabs)');
        }
      } catch (error) { console.error('Create profile error:', error); }
      finally { setLoading(false); }
    }
  };

  const renderSlide = ({ item, index }) => (
    <View style={[styles.slide, { width }]}>
      <AppText weight="bold" style={styles.title}>{item.title}</AppText>
      <AppText style={styles.description}>{item.description}</AppText>
    </View>
  );

  const renderProfileSetup = () => (
    <View style={[styles.slide, { width }]}>
      <AppText weight="bold" style={styles.title}>Thiết lập hồ sơ</AppText>
      <AppText style={styles.description}>Hãy cho cộng đồng biết bạn là ai</AppText>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Biệt danh (Nickname)" value={nickname} onChangeText={setNickname} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Giới thiệu bản thân (Bio)" value={bio} onChangeText={setBio} multiline numberOfLines={3} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...ONBOARDING_DATA, { id: 'setup' }]}
        renderItem={({ item, index }) => index < ONBOARDING_DATA.length ? renderSlide({ item, index }) : renderProfileSetup()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        ref={slidesRef}
      />
      <View style={styles.footer}>
        <View style={styles.paginator}>
          {[...ONBOARDING_DATA, { id: 'setup' }].map((_, i) => {
            const dotWidth = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [10, 20, 10], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth }]} />;
          })}
        </View>
        <TouchableOpacity style={[styles.nextBtn, currentIndex === ONBOARDING_DATA.length && !nickname.trim() && { opacity: 0.5 }]} onPress={handleNext} disabled={loading}>
          <ChevronRight size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { flex: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20, color: Colors.text },
  description: { fontSize: 16, textAlign: 'center', color: Colors.textSecondary, lineHeight: 24 },
  form: { width: '100%', marginTop: 40 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, marginBottom: 16, fontFamily: 'Quicksand-Medium', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 40, paddingBottom: 60 },
  paginator: { flexDirection: 'row', gap: 8 },
  dot: { height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  nextBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadow.medium },
});
