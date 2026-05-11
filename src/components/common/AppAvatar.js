import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import AppText from './AppText';

const AppAvatar = ({ src, name, size = 40, style }) => {
  const [hasError, setHasError] = useState(false);

  // Lấy ký tự đầu (Logic giống Web)
  const getInitials = (userName) => {
    if (!userName) return "?";
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Màu sắc ngẫu nhiên dựa trên tên (Logic giống Web)
  const stringToColor = (str) => {
    let hash = 0;
    const stringToHash = str || "User";
    for (let i = 0; i < stringToHash.length; i++) {
      hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#F43F5E', '#0EA5E9', '#F59E0B', '#10B981', 
      '#6366F1', '#8B5CF6', '#D946EF', '#F97316'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const shouldShowImage = src && src.trim() !== "" && !src.includes('ui-avatars.com') && !hasError;

  if (shouldShowImage) {
    return (
      <Image
        source={{ uri: src }}
        style={[
          { width: size, height: size, borderRadius: size / 2 },
          styles.avatarImage,
          style
        ]}
        onError={() => setHasError(true)}
      />
    );
  }

  // Fallback UI (Giống Web)
  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  return (
    <View style={[
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      styles.fallbackContainer,
      style
    ]}>
      <AppText style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AppAvatar;
