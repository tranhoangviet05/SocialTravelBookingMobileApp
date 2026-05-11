import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton from '../common/Skeleton';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

const PostSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.headerInfo}>
          <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={80} height={12} />
        </View>
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={14} />
      </View>

      {/* Media Skeleton */}
      <Skeleton width="100%" height={250} borderRadius={0} />

      {/* Footer Skeleton */}
      <View style={styles.footer}>
        <View style={styles.actionGroup}>
          <Skeleton width={50} height={20} borderRadius={10} />
          <Skeleton width={50} height={20} borderRadius={10} />
        </View>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerInfo: {
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 20,
  },
});

export default PostSkeleton;
