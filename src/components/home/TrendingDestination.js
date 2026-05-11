import React from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin } from 'lucide-react-native';
import AppText from '../common/AppText';

const TrendingDestination = ({ destination, getImageUrl, width }) => {
  return (
    <TouchableOpacity style={[styles.featuredCard, { width: width - 40 }]}>
      <ImageBackground
        source={{ uri: getImageUrl(destination.image_url) }}
        style={styles.featuredImage}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredOverlay}
        >
          <AppText style={styles.featuredLocation}>{destination.name?.toUpperCase()}</AppText>
          <View style={styles.featuredTag}>
            <MapPin color="#fff" size={14} />
            <AppText style={styles.featuredTagText}>{destination.parent?.name || 'Việt Nam'}</AppText>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredCard: { marginRight: 15 },
  featuredImage: { width: '100%', height: 250 },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 20,
  },
  featuredLocation: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  featuredTag: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  featuredTagText: { color: '#fff', fontSize: 14, marginLeft: 4, opacity: 0.9 },
});

export default TrendingDestination;
