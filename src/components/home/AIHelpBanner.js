import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, Sparkles, Navigation } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Typography } from '../../constants/Typography';

const AIHelpBanner = ({ onPress }) => {
  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiCard}
    >
      <View style={styles.aiContent}>
        <View style={styles.aiHeader}>
          <Lightbulb color="#fff" size={28} />
          <AppText style={styles.aiTitle}>Trợ giúp từ Social Travel Booking</AppText>
        </View>
        <AppText style={styles.aiDesc}>
          Để Social Travel Booking giúp bạn xây dựng một hành trình du lịch hoàn hảo dựa trên sở thích cá nhân chỉ trong vài giây.
        </AppText>
        <TouchableOpacity style={styles.aiButton} onPress={onPress}>
          <Sparkles color="#4F46E5" size={18} />
          <AppText style={styles.aiButtonText}>Xây dựng hành trình cho tôi</AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.aiIconFloating}>
        <Navigation color="rgba(255,255,255,0.2)" size={100} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  aiCard: {
    margin: Typography.spacing.md,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    marginTop: 30,
  },
  aiContent: { zIndex: 1 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  aiDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, marginBottom: 20, width: '80%' },
  aiButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  aiButtonText: { color: '#4F46E5', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  aiIconFloating: { position: 'absolute', right: -20, bottom: -20 },
});

export default AIHelpBanner;
