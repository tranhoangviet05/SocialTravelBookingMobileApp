import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import AppText from '../common/AppText';

const PaymentTimer = ({ timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isWarning = timeLeft < 60;

  return (
    <View style={styles.timerSection}>
      <Clock size={20} color={isWarning ? '#EF4444' : Colors.primary} />
      <AppText style={[styles.timerText, isWarning && { color: '#EF4444' }]}>
        Vui lòng thanh toán trong: {formatTime(timeLeft)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  timerSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 16,
    marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#F1F5F9'
  },
  timerText: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
});

export default PaymentTimer;
