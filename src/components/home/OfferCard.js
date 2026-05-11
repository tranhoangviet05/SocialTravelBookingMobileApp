import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift } from 'lucide-react-native';
import AppText from '../common/AppText';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const OfferCard = ({ item, index }) => {
  const getOfferGradient = (idx) => {
    const gradients = [
      ['#FF9A8B', '#FF6A88'],
      ['#A18CD1', '#FBC2EB'],
      ['#84FAB0', '#8FD3F4'],
      ['#FAD0C4', '#FFD1FF'],
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <LinearGradient
      colors={getOfferGradient(index)}
      style={styles.offerCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.offerContent}>
        <Gift color="#fff" size={24} style={{ marginBottom: 8 }} />
        <AppText style={styles.offerTitle} numberOfLines={1}>{item.code}</AppText>
        <AppText style={styles.offerSubtitle} numberOfLines={2}>
          {item.type === 'percent' ? `Giảm ${item.discount_value}%` : `Giảm ${formatCurrency(item.discount_value)}`}
        </AppText>
        <View style={styles.promoBadge}>
          <AppText style={styles.promoText}>MIN: {formatCurrency(item.min_order_amount)}</AppText>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  offerCard: {
    width: width * 0.6,
    height: 150,
    marginRight: 15,
    borderRadius: 20,
    padding: 16,
  },
  offerContent: { flex: 1, justifyContent: 'center' },
  offerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  offerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 10 },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default OfferCard;
