import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Colors } from '../../constants/theme';

const AppAvatar = ({ src, name, size = 40, style }) => {
  const renderInitials = () => {
    if (!name) return '?';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return initials.substring(0, 2);
  };

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: size / 2 },
      style
    ]}>
      {src ? (
        <Image 
          source={{ uri: src }} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.initialsContainer, { backgroundColor: Colors.primaryLight }]}>
          <AppText weight="bold" style={{ fontSize: size * 0.4, color: Colors.primary }}>
            {renderInitials()}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppAvatar;
